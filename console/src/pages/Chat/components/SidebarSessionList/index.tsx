import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  requestSessionsListRefresh,
  XCLAW_NEW_CHAT_SESSION_EVENT,
} from "../../chatNewSessionBridge";
import styles from "./index.module.less";

interface ExtendedSession extends IAgentScopeRuntimeWebUISession {
  realId?: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  channel?: string;
  updateAt?: number;
}

function getBackendId(session: ExtendedSession): string | null {
  if (session.realId) return session.realId;
  const id = session.id;
  if (!id) return null;
  if (!/^\d+$/.test(id)) return id;
  return null;
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
  const [sessions, setSessions] = useState<ExtendedSession[]>([]);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const chatId = useMemo(() => {
    const match = location.pathname.match(/^\/chat\/(.+)$/);
    return match?.[1];
  }, [location.pathname]);

  const load = useCallback(() => {
    void sessionApi
      .getSessionList()
      .then((list) => setSessions(list as ExtendedSession[]))
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onRefresh = () => load();
    window.addEventListener(XCLAW_NEW_CHAT_SESSION_EVENT, onRefresh);
    return () =>
      window.removeEventListener(XCLAW_NEW_CHAT_SESSION_EVENT, onRefresh);
  }, [load]);

  useEffect(() => {
    if (location.pathname.startsWith("/chat")) load();
  }, [location.pathname, load]);

  const sorted = useMemo(() => {
    return [...sessions].sort((a, b) => sessionSortTs(b) - sessionSortTs(a));
  }, [sessions]);

  const grouped = useMemo(() => {
    const map = new Map<string, ExtendedSession[]>();
    const now = Date.now();
    for (const s of sorted) {
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
    (sessionId: string) => {
      navigate(`/chat/${sessionId}`);
    },
    [navigate],
  );

  const handleDelete = useCallback(
    async (sessionId: string) => {
      const session = sessions.find((s) => s.id === sessionId) as
        | ExtendedSession
        | undefined;
      const backendId = session ? getBackendId(session) : null;
      if (backendId) {
        await chatApi.deleteChat(backendId);
      }
      if (chatId === sessionId) {
        const next = sessions.filter((s) => s.id !== sessionId);
        navigate(next[0]?.id ? `/chat/${next[0].id}` : "/chat");
      }
      load();
      requestSessionsListRefresh();
    },
    [sessions, chatId, navigate, load],
  );

  const handleEditStart = useCallback((sessionId: string, name: string) => {
    setEditingSessionId(sessionId);
    setEditValue(name);
  }, []);

  const handleEditSubmit = useCallback(async () => {
    if (!editingSessionId) return;
    const session = sessions.find((s) => s.id === editingSessionId) as
      | ExtendedSession
      | undefined;
    const backendId = session ? getBackendId(session) : null;
    const newName = editValue.trim();
    if (backendId && newName && session) {
      await chatApi.updateChat(backendId, { name: newName });
    }
    setEditingSessionId(null);
    setEditValue("");
    load();
    requestSessionsListRefresh();
  }, [editingSessionId, editValue, sessions, load]);

  const handleEditCancel = useCallback(() => {
    setEditingSessionId(null);
    setEditValue("");
  }, []);

  if (collapsed) return null;

  return (
    <div className={styles.host}>
      <div className={styles.listWrap}>
        <div className={styles.list}>
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
                      name={session.name || "New Chat"}
                      channelKey={channelKey || undefined}
                      channelLabel={channelLabel}
                      active={session.id === chatId}
                      editing={editingSessionId === session.id}
                      editValue={
                        editingSessionId === session.id ? editValue : undefined
                      }
                      onClick={() =>
                        session.id && handleSessionClick(session.id)
                      }
                      onEdit={() =>
                        handleEditStart(
                          session.id!,
                          session.name || "New Chat",
                        )
                      }
                      onDelete={() => session.id && handleDelete(session.id)}
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
      </div>
    </div>
  );
}
