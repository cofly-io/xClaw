/**
 * Bridge sidebar / shell "new session" actions into @agentscope-ai/chat's
 * useChatAnywhereSessions().createSession(), which must run inside the
 * AgentScopeRuntimeWebUI provider tree.
 */

export const XCLAW_NEW_CHAT_SESSION_EVENT = "xclaw:new-chat-session";

export const XCLAW_PENDING_NEW_CHAT_SESSION_KEY = "xclaw:pending-new-chat-session";

/** Sidebar / shell: ask the Chat runtime to reload sessions from the API into context. */
export const XCLAW_REFRESH_SESSIONS_EVENT = "xclaw:refresh-sessions";

export function requestSessionsListRefresh(): void {
  window.dispatchEvent(new Event(XCLAW_REFRESH_SESSIONS_EVENT));
}

export function isChatRoute(pathname: string): boolean {
  return pathname === "/chat" || pathname.startsWith("/chat/");
}

/**
 * @param navigate - e.g. from react-router useNavigate()
 */
export function requestNewChatSessionFromShell(
  pathname: string,
  navigate: (to: string) => void,
): void {
  if (!isChatRoute(pathname)) {
    try {
      sessionStorage.setItem(XCLAW_PENDING_NEW_CHAT_SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    navigate("/chat");
    return;
  }
  window.dispatchEvent(new Event(XCLAW_NEW_CHAT_SESSION_EVENT));
}
