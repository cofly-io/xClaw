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

function findSessionForChatId(
  sessions: IAgentScopeRuntimeWebUISession[],
  chatId: string,
): IAgentScopeRuntimeWebUISession | undefined {
  return sessions.find((s) => sessionMatchesChatId(s, chatId));
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
 *
 * IMPORTANT: sessions array reference changes (e.g. from polling in pinned drawer)
 * must NOT re-trigger setCurrentSessionId when the chatId hasn't changed, otherwise
 * it causes an infinite loop of getSession calls bouncing between two chat IDs.
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

  const [pendingId, setPendingId] = useState<string | null>(null);
  const pendingIdRef = useRef<string | null>(null);
  const loadingGuardRef = useRef<number | null>(null);
  const emptyLibrarySyncDoneRef = useRef(false);
  const noMatchListRefreshRef = useRef<string | null>(null);
  const isFirstMountRef = useRef(true);
  /** URL chat id we already switched the runtime to (prevents re-entrant sync). */
  const syncedChatIdRef = useRef<string | null>(null);
  /** URL chat id we already requested a direct getSession for (no-match path). */
  const directFetchChatIdRef = useRef<string | null>(null);

  /** Track the last chatId for which we called setCurrentSessionId, so that
   *  subsequent sessions array reference changes (from polling in pinned drawer)
   *  don't re-trigger setCurrentSessionId and cause infinite getSession loops. */
  const lastAppliedChatIdRef = useRef<string | undefined>(undefined);

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
    isFirstMountRef.current = true;
    syncedChatIdRef.current = null;
    directFetchChatIdRef.current = null;
    lastAppliedChatIdRef.current = undefined;
  }, [chatId]);

  const switchToSession = (libraryId: string) => {
    onLoadingChange?.(true);
    pendingIdRef.current = libraryId;
    setPendingId(libraryId);
    lastAppliedChatIdRef.current = chatId;
    setCurrentSessionId(libraryId);
  };

  const fetchAndApplySession = (urlChatId: string) => {
    if (directFetchChatIdRef.current === urlChatId) return;
    directFetchChatIdRef.current = urlChatId;
    void sessionApi
      .getSession(urlChatId)
      .then((loaded) => {
        const libId = loaded.id;
        const prev = sessionsRef.current;
        const idx = prev.findIndex(
          (s) => s.id === libId || sessionMatchesChatId(s, urlChatId),
        );
        const next =
          idx >= 0
            ? prev.map((s, i) => (i === idx ? { ...s, ...loaded } : s))
            : [...prev, loaded];
        setSessions(next);
        syncedChatIdRef.current = urlChatId;
        switchToSession(libId);
      })
      .catch((err) => {
        directFetchChatIdRef.current = null;
        console.error(
          "[xclaw][ChatSessionInitializer] getSession failed:",
          err,
        );
        onLoadingChange?.(false);
      });
  };

  useEffect(() => {
    if (!chatId) {
      onLoadingChange?.(false);
      pendingIdRef.current = null;
      setPendingId(null);
      return;
    }

    if (sessions.length === 0) {
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
      fetchAndApplySession(chatId);
      return;
    }

    const matching = findSessionForChatId(sessions, chatId);
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
      fetchAndApplySession(chatId);
      return;
    }

    // Issue #4557: skip while a user-initiated session switch is in progress.
    if (sessionApi.isSessionSwitching) return;

    // onSessionSelected already navigated to this chatId — skip redundant sync.
    if (sessionApi.lastNavigatedChatId === chatId) {
      lastAppliedChatIdRef.current = chatId;
      sessionApi.lastNavigatedChatId = null;
      return;
    }

    // Pinned-drawer polling refreshes `sessions` without changing chatId.
    if (chatId === lastAppliedChatIdRef.current) {
      return;
    }

    const isCurrentSession = currentSessionIdRef.current === matching.id;
    const currentInLibrary = sessions.find(
      (s) => s.id === currentSessionIdRef.current,
    );
    const currentMatchesUrl =
      !!currentInLibrary && sessionMatchesChatId(currentInLibrary, chatId);
    const historyLoaded =
      sessionApi.getLoadedMessageCount(chatId) > 0 ||
      (matching.messages?.length ?? 0) > 0;

    if (
      syncedChatIdRef.current === chatId &&
      isCurrentSession &&
      !isFirstMountRef.current &&
      currentMatchesUrl
    ) {
      lastAppliedChatIdRef.current = chatId;
      onLoadingChange?.(false);
      pendingIdRef.current = null;
      setPendingId(null);
      return;
    }

    if (
      isCurrentSession &&
      !isFirstMountRef.current &&
      currentMatchesUrl &&
      historyLoaded
    ) {
      syncedChatIdRef.current = chatId;
      lastAppliedChatIdRef.current = chatId;
      onLoadingChange?.(false);
      pendingIdRef.current = null;
      setPendingId(null);
      return;
    }

    isFirstMountRef.current = false;

    if (syncedChatIdRef.current === chatId && isCurrentSession) {
      return;
    }

    syncedChatIdRef.current = chatId;
    switchToSession(matching.id);
    // Runtime calls sessionApi.getSession once via setCurrentSessionId.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, sessions, setCurrentSessionId, setSessions, onLoadingChange]);

  useEffect(() => {
    currentSessionIdRef.current = currentSessionId;

    if (!pendingId) return;
    if (currentSessionId !== pendingId) return;

    let cancelled = false;

    const finish = () => {
      if (cancelled) return;
      if (loadingGuardRef.current !== null) {
        window.clearTimeout(loadingGuardRef.current);
        loadingGuardRef.current = null;
      }
      onLoadingChange?.(false);
      pendingIdRef.current = null;
      setPendingId(null);
    };

    void (async () => {
      try {
        await sessionApi.waitForSessionFetch(currentSessionId);
      } catch (err) {
        console.error(
          "[xclaw][ChatSessionInitializer] waitForSessionFetch failed:",
          err,
        );
      }
      if (cancelled) return;

      const session = sessionsRef.current.find(
        (s) => s.id === currentSessionId,
      );
      const hasMessages = (session?.messages?.length ?? 0) > 0;

      if (hasMessages) {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(finish);
        });
        return;
      }

      window.setTimeout(finish, 1000);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSessionId, pendingId, onLoadingChange, chatId]);

  return null;
};

export default ChatSessionInitializer;
