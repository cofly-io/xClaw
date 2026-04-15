import { useEffect } from "react";
import { useChatAnywhereSessions } from "@agentscope-ai/chat";
import {
  XCLAW_NEW_CHAT_SESSION_EVENT,
  XCLAW_PENDING_NEW_CHAT_SESSION_KEY,
  requestSessionsListRefresh,
} from "../../chatNewSessionBridge";

/**
 * Listens for shell-triggered new-session requests and runs the same
 * createSession() as the (hidden) input-prefix control.
 */
export default function ChatNewSessionBridge() {
  const { createSession } = useChatAnywhereSessions();

  useEffect(() => {
    const run = () => {
      void (async () => {
        try {
          await createSession();
        } finally {
          requestSessionsListRefresh();
        }
      })();
    };

    window.addEventListener(XCLAW_NEW_CHAT_SESSION_EVENT, run);

    try {
      if (sessionStorage.getItem(XCLAW_PENDING_NEW_CHAT_SESSION_KEY) === "1") {
        sessionStorage.removeItem(XCLAW_PENDING_NEW_CHAT_SESSION_KEY);
        run();
      }
    } catch {
      /* ignore */
    }

    return () =>
      window.removeEventListener(XCLAW_NEW_CHAT_SESSION_EVENT, run);
  }, [createSession]);

  return null;
}
