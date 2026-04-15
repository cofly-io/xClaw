import { useEffect } from "react";
import { useChatAnywhereSessionsState } from "@agentscope-ai/chat";
import sessionApi from "../../sessionApi";
import { XCLAW_REFRESH_SESSIONS_EVENT } from "../../chatNewSessionBridge";

/**
 * Keeps @agentscope-ai/chat session state in sync when the sidebar mutates the list
 * or triggers a refresh via {@link XCLAW_REFRESH_SESSIONS_EVENT}.
 */
export default function ChatSessionsRefreshListener() {
  const { setSessions } = useChatAnywhereSessionsState();

  useEffect(() => {
    const onRefresh = () => {
      void sessionApi.getSessionList().then(setSessions).catch(() => {});
    };
    window.addEventListener(XCLAW_REFRESH_SESSIONS_EVENT, onRefresh);
    return () =>
      window.removeEventListener(XCLAW_REFRESH_SESSIONS_EVENT, onRefresh);
  }, [setSessions]);

  return null;
}
