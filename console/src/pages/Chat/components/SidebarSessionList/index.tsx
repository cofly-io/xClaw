import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Spin } from "antd";
import { useTranslation } from "react-i18next";
import { useAgentStore } from "../../../../stores/agentStore";
import type { IAgentScopeRuntimeWebUISession } from "@agentscope-ai/chat";
import { chatApi } from "../../../../api/modules/chat";
import sessionApi from "../../sessionApi";
import ChatSessionItem from "../ChatSessionItem";
import { getChannelLabel } from "../../../Control/Channels/components";
import {
  formatSessionGroupHeader,
  getSessionBucket,
  orderedSessionBucketKeys,
  parseSessionBucketKey,
  sessionBucketKey,
} from "../../sessionCalendarGroup";
import {
  XCLAW_NEW_CHAT_SESSION_EVENT,
  XCLAW_REFRESH_SESSIONS_EVENT,
} from "../../chatNewSessionBridge";
import styles from "./index.module.less";

interface ExtendedSession extends IAgentScopeRuntimeWebUISession {
  realId?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  channel?: string;
  updateAt?: number;
  pinned?: boolean;
}

function getBackendId(session: ExtendedSession): string | null {
  if (session.realId) return session.realId;
  const id = session.id;
  if (!id) return null;
  if (!/^\d+$/.test(id)) return id;
  return null;
}

function sessionMatchesChatRoute(
  session: ExtendedSession,
  chatId: string | undefined,
): boolean {
  if (!chatId) return false;
  if (session.id === chatId) return true;
  if (session.realId === chatId) return true;
  return getBackendId(session) === chatId;
}

function sessionSortTs(s: ExtendedSession): number {
  const updated = s.updatedAt ? new Date(s.updatedAt).getTime() : NaN;
  if (!Number.isNaN(updated)) return updated;
  if (typeof s.updateAt === "number") return s.updateAt;
  const created = s.createdAt ? new Date(s.createdAt).getTime() : NaN;
  if (!Number.isNaN(created)) return created;
  return Date.now();
}

function groupSortTs(s: ExtendedSession): number {
  const updated = s.updatedAt ? new Date(s.updatedAt).getTime() : NaN;
  if (!Number.isNaN(updated)) return updated;
  if (typeof s.updateAt === "number") return s.updateAt;
  const created = s.createdAt ? new Date(s.createdAt).getTime() : NaN;
  if (!Number.isNaN(created)) return created;
  return Date.now();
}

export default function SidebarSessionList({
  collapsed,
}: {
  collapsed: boolean;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedAgent } = useAgentStore();
  const [sessions, setSessions] = useState<ExtendedSession[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const chatId = useMemo(() => {
    const match = location.pathname.match(/^\/chat\/(.+)$/);
    return match?.[1];
  }, [location.pathname]);

  const load = useCallback(async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false;
    if (!silent) {
      setListLoading(true);
      setListError(null);
    }
    try {
      const list = await sessionApi.getSessionList();
      setSessions(list as ExtendedSession[]);
    } catch (error) {
      console.error("[xclaw][SidebarSessionList] load failed:", error);
      if (!silent) {
        setSessions([]);
        setListError(
          error instanceof Error ? error.message : "Failed to load sessions",
        );
      }
    } finally {
      if (!silent) {
        setListLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    sessionApi.invalidateSessionList();
    void load();
  }, [load, selectedAgent]);

  useEffect(() => {
    const onNewChat = () => {
      void load({ silent: true });
    };
    window.addEventListener(XCLAW_NEW_CHAT_SESSION_EVENT, onNewChat);
    return () => {
      window.removeEventListener(XCLAW_NEW_CHAT_SESSION_EVENT, onNewChat);
    };
  }, [load]);

  // Sync after first reply registers chat on backend (sessionApi.updateSession).
  useEffect(() => {
    const onRefresh = () => {
      void load({ silent: true });
    };
    window.addEventListener(XCLAW_REFRESH_SESSIONS_EVENT, onRefresh);
    return () => {
      window.removeEventListener(XCLAW_REFRESH_SESSIONS_EVENT, onRefresh);
    };
  }, [load]);

  const sorted = useMemo(() => {
    return [...sessions].sort((a, b) => sessionSortTs(b) - sessionSortTs(a));
  }, [sessions]);

  const pinnedSessions = useMemo(
    () => sorted.filter((s) => (s as ExtendedSession).pinned),
    [sorted],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, ExtendedSession[]>();
    const now = Date.now();
    for (const s of sorted) {
      if ((s as ExtendedSession).pinned) continue;
      const k = sessionBucketKey(getSessionBucket(groupSortTs(s), now));
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(s);
    }
    return map;
  }, [sorted]);

  const orderedKeys = useMemo(
    () => orderedSessionBucketKeys(new Set(grouped.keys())),
    [grouped],
  );

  const handleSessionClick = useCallback(
    (session: ExtendedSession) => {
      const targetId = getBackendId(session) ?? session.id;
      if (!targetId) return;
      navigate(`/chat/${targetId}`);
    },
    [navigate],
  );

  const handleDelete = useCallback(
    (sessionId: string) => {
      const session = sessions.find((s) => s.id === sessionId) as
        | ExtendedSession
        | undefined;
      const backendId = session ? getBackendId(session) : null;
      const snapshot = sessions;
      const remaining = sessions.filter((s) => s.id !== sessionId);

      setSessions(remaining);
      sessionApi.evictSessionFromList(sessionId);

      if (session && sessionMatchesChatRoute(session, chatId)) {
        const next = remaining[0];
        if (next) {
          const targetId = getBackendId(next) ?? next.id;
          navigate(targetId ? `/chat/${targetId}` : "/chat");
        } else {
          navigate("/chat");
        }
      }

      if (!backendId) return;

      void chatApi.deleteChat(backendId).catch((error) => {
        console.error("[xclaw][SidebarSessionList] delete failed:", error);
        setSessions(snapshot);
        void load();
      });
    },
    [sessions, chatId, navigate, load],
  );

  const handleEditStart = useCallback((sessionId: string, name: string) => {
    setEditingSessionId(sessionId);
    setEditValue(name);
  }, []);

  const handleEditSubmit = useCallback(() => {
    if (!editingSessionId) return;
    const session = sessions.find((s) => s.id === editingSessionId) as
      | ExtendedSession
      | undefined;
    const backendId = session ? getBackendId(session) : null;
    const newName = editValue.trim();
    setEditingSessionId(null);
    setEditValue("");
    if (!backendId || !newName || !session) return;

    setSessions((prev) =>
      prev.map((s) => (s.id === editingSessionId ? { ...s, name: newName } : s)),
    );
    void chatApi.updateChat(backendId, { name: newName }).catch((error) => {
      console.error("[xclaw][SidebarSessionList] rename failed:", error);
      void load({ silent: true });
    });
  }, [editingSessionId, editValue, sessions, load]);

  const handleEditCancel = useCallback(() => {
    setEditingSessionId(null);
    setEditValue("");
  }, []);

  const handlePin = useCallback(
    (sessionId: string) => {
      const session = sessions.find((s) => s.id === sessionId) as
        | ExtendedSession
        | undefined;
      const backendId = session ? getBackendId(session) : null;
      if (!backendId || !session) return;
      const nextPinned = !session.pinned;

      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId ? { ...s, pinned: nextPinned } : s,
        ),
      );
      void chatApi.updateChat(backendId, { pinned: nextPinned }).catch((error) => {
        console.error("[xclaw][SidebarSessionList] pin failed:", error);
        void load({ silent: true });
      });
    },
    [sessions, load],
  );

  if (collapsed) return null;

  return (
    <div className={styles.host}>
      <div className={styles.listWrap}>
        {listLoading ? (
          <div className={styles.listLoading}>
            <Spin size="small" />
          </div>
        ) : listError ? (
          <div className={styles.listError}>{listError}</div>
        ) : (
        <div className={styles.list}>
          {pinnedSessions.length > 0 && (
            <>
              <div className={styles.groupHeader}>
                {t("chat.pinnedGroup", "Pinned")}
              </div>
              {pinnedSessions.map((session) => {
                const ext = session as ExtendedSession;
                const channelKey = ext.channel?.trim() || "";
                const channelLabel = channelKey
                  ? getChannelLabel(channelKey, t)
                  : undefined;
                return (
                  <ChatSessionItem
                    key={session.id}
                    sessionId={session.id}
                    name={session.name || "New Chat"}
                    channelKey={channelKey || undefined}
                    channelLabel={channelLabel}
                    pinned={!!ext.pinned}
                    active={sessionMatchesChatRoute(ext, chatId)}
                    editing={editingSessionId === session.id}
                    editValue={
                      editingSessionId === session.id ? editValue : undefined
                    }
                    onClick={() => session.id && handleSessionClick(ext)}
                    onEdit={() =>
                      handleEditStart(session.id!, session.name || "New Chat")
                    }
                    onDelete={() => session.id && handleDelete(session.id)}
                    onPin={() => session.id && handlePin(session.id)}
                    onEditChange={setEditValue}
                    onEditSubmit={handleEditSubmit}
                    onEditCancel={handleEditCancel}
                  />
                );
              })}
            </>
          )}
          {orderedKeys.map((key) => {
            const items = grouped.get(key) ?? [];
            if (!items.length) return null;
            const bucket = parseSessionBucketKey(key);
            return (
              <React.Fragment key={key}>
                <div className={styles.groupHeader}>
                  {formatSessionGroupHeader(bucket, t)}
                </div>
                {items.map((session) => {
                  const ext = session;
                  const channelKey = ext.channel?.trim() || "";
                  const channelLabel = channelKey
                    ? getChannelLabel(channelKey, t)
                    : undefined;
                  return (
                    <ChatSessionItem
                      key={session.id}
                      sessionId={session.id}
                      name={session.name || "New Chat"}
                      channelKey={channelKey || undefined}
                      channelLabel={channelLabel}
                      pinned={!!(ext as ExtendedSession).pinned}
                      active={sessionMatchesChatRoute(ext, chatId)}
                      editing={editingSessionId === session.id}
                      editValue={
                        editingSessionId === session.id ? editValue : undefined
                      }
                      onClick={() => session.id && handleSessionClick(ext)}
                      onEdit={() =>
                        handleEditStart(session.id!, session.name || "New Chat")
                      }
                      onDelete={() => session.id && handleDelete(session.id)}
                      onPin={() => session.id && handlePin(session.id)}
                      onEditChange={setEditValue}
                      onEditSubmit={handleEditSubmit}
                      onEditCancel={handleEditCancel}
                    />
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
        )}
      </div>
    </div>
  );
}
