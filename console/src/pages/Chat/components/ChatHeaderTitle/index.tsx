import React, { useEffect } from "react";
import { useChatAnywhereSessionsState } from "@agentscope-ai/chat";

export const XCLAW_CHAT_HEADER_TITLE_EVENT = "xclaw:chat-header-title";

const ChatHeaderTitle: React.FC = () => {
  const { sessions, currentSessionId } = useChatAnywhereSessionsState();
  const currentSession = sessions.find((s) => s.id === currentSessionId);
  const chatName = currentSession?.name || "New Chat";

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent<string>(XCLAW_CHAT_HEADER_TITLE_EVENT, {
        detail: chatName,
      }),
    );
  }, [chatName]);

  return null;
};

export default ChatHeaderTitle;
