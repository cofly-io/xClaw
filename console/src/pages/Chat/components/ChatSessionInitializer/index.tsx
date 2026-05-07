import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  useChatAnywhereSessionsState,
  type IAgentScopeRuntimeWebUISession,
} from "@agentscope-ai/chat";
import sessionApi from "../../sessionApi";

function sessionMatchesChatId(
  session: IAgentScopeRuntimeWebUISession,
  chatId: string,
): boolean {
  if (session.id === chatId) return true;
  const realId = (session as { realId?: string }).realId;
  if (realId && realId === chatId) return true;
  return false;
}

export interface ChatSessionInitializerProps {
  onLoadingChange?: (loading: boolean) => void;
}

/**
 * URL chatId → context currentSessionId (one direction of bidirectional sync).
 *
 * Loading overlay lifecycle:
 *   1. chatId changes → show overlay + setCurrentSessionId(matching.id)
 *   2. runtime currentSessionId switches to target AND session has messages
 *      (or a fallback timeout fires) → hide overlay
 *
 * Note: On bare `/chat`, runtimeSessionApi returns an empty session list so the
 * library does not auto-pick sessions[0]. Navigating to `/chat/:id` does not
 * always trigger a fresh list fetch; we must sync via getSessionList +
 * setSessions before setCurrentSessionId can run.
 */
const ChatSessionInitializer: React.FC<ChatSessionInitializerProps> = ({
  onLoadingChange,
}) => {
  const location = useLocation();
  const chatId = useMemo(() => {
    const match = location.pathname.match(/^\/chat\/(.+)$/);
    return match?.[1];
  }, [location.pathname]);

  const { sessions, currentSessionId, setCurrentSessionId, setSessions } =
    useChatAnywhereSessionsState();

  const currentSessionIdRef = useRef(currentSessionId);
  currentSessionIdRef.current = currentSessionId;
  const sessionsRef = useRef(sessions);
  sessionsRef.current = sessions;

  /**
   * The runtime session id we are waiting for the runtime to fully display.
   * null means "no pending switch".
   */
  const [pendingId, setPendingId] = useState<string | null>(null);
  const pendingIdRef = useRef<string | null>(null);
  const loadingGuardRef = useRef<number | null>(null);
  /** After `/chat` the library may still have []; sync list once per URL chatId. */
  const emptyLibrarySyncDoneRef = useRef(false);
  /** If URL id is missing from library list, refresh list once per chatId. */
  const noMatchListRefreshRef = useRef<string | null>(null);

  // Global guard: never keep overlay forever if matching chain gets stuck.
  useEffect(() => {
    if (!chatId) return;
    if (loadingGuardRef.current !== null) {
      window.clearTimeout(loadingGuardRef.current);
    }
    loadingGuardRef.current = window.setTimeout(() => {
      console.warn("[xclaw][ChatSessionInitializer] loading guard timeout", {
        chatId,
        currentSessionId: currentSessionIdRef.current,
        pendingId: pendingIdRef.current,
      });
      onLoadingChange?.(false);
      pendingIdRef.current = null;
      setPendingId(null);
    }, 15000);

    return () => {
      if (loadingGuardRef.current !== null) {
        window.clearTimeout(loadingGuardRef.current);
        loadingGuardRef.current = null;
      }
    };
  }, [chatId, onLoadingChange]);

  useEffect(() => {
    emptyLibrarySyncDoneRef.current = false;
    noMatchListRefreshRef.current = null;
  }, [chatId]);

  // ── Step 1: react to URL chatId or session list changes ──────────────────
  useEffect(() => {
    if (!chatId) {
      onLoadingChange?.(false);
      pendingIdRef.current = null;
      setPendingId(null);
      return;
    }

    if (sessions.length === 0) {
      // Sessions not loaded yet — proactively fetch; wait for next cycle
      onLoadingChange?.(true);
      if (!emptyLibrarySyncDoneRef.current) {
        emptyLibrarySyncDoneRef.current = true;
        void sessionApi
          .getSessionList()
          .then(setSessions)
          .catch((err) => {
            emptyLibrarySyncDoneRef.current = false;
            console.error(
              "[xclaw][ChatSessionInitializer] getSessionList failed (library empty)",
              err,
            );
          });
      }
      void sessionApi.getSession(chatId).catch((err) => {
        console.error(
          "[xclaw][ChatSessionInitializer] getSession failed when sessions empty",
          err,
        );
        onLoadingChange?.(false);
      });
      return;
    }

    const matching = sessions.find((s) => sessionMatchesChatId(s, chatId));
    if (!matching) {
      onLoadingChange?.(true);
      if (noMatchListRefreshRef.current !== chatId) {
        noMatchListRefreshRef.current = chatId;
        void sessionApi
          .getSessionList()
          .then(setSessions)
          .catch((err) => {
            if (noMatchListRefreshRef.current === chatId) {
              noMatchListRefreshRef.current = null;
            }
            console.error(
              "[xclaw][ChatSessionInitializer] getSessionList failed (no matching session)",
              err,
            );
          });
      }
      void sessionApi.getSession(chatId).catch((err) => {
        console.error(
          "[xclaw][ChatSessionInitializer] getSession failed when no matching",
          err,
        );
        onLoadingChange?.(false);
      });
      return;
    }

    if (currentSessionIdRef.current === matching.id) {
      // Already on the correct session — nothing to do
      onLoadingChange?.(false);
      pendingIdRef.current = null;
      setPendingId(null);
      return;
    }

    // Need to switch — show overlay and queue the switch
    onLoadingChange?.(true);
    pendingIdRef.current = matching.id;
    setPendingId(matching.id);
    setCurrentSessionId(matching.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, sessions, setCurrentSessionId, setSessions, onLoadingChange]);

  // ── Step 2: watch runtime state until target session is ready ────────────
  useEffect(() => {
    currentSessionIdRef.current = currentSessionId;

    if (!pendingId) return;
    if (currentSessionId !== pendingId) return;

    // Runtime has switched to the target session — dismiss overlay.
    // Use sessionsRef (not sessions) to avoid resetting the timer on list updates.
    const finish = () => {
      if (loadingGuardRef.current !== null) {
        window.clearTimeout(loadingGuardRef.current);
        loadingGuardRef.current = null;
      }
      onLoadingChange?.(false);
      pendingIdRef.current = null;
      setPendingId(null);
    };

    const session = sessionsRef.current.find((s) => s.id === currentSessionId);
    const hasMessages = (session?.messages?.length ?? 0) > 0;

    if (hasMessages) {
      const t = window.requestAnimationFrame(finish);
      return () => window.cancelAnimationFrame(t);
    }

    // Messages not yet in context — give the loader a moment then dismiss
    const t = window.setTimeout(finish, 300);
    return () => window.clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSessionId, pendingId, onLoadingChange]);

  return null;
};

export default ChatSessionInitializer;
