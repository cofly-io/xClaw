import React, { useEffect, useMemo } from "react";
import { useChatAnywhereSessionsState } from "@agentscope-ai/chat";

export const XCLAW_CHAT_HEADER_TITLE_EVENT = "xclaw:chat-header-title";

const HEADER_TITLE_MAX_CHARS = 48;

export interface ChatHeaderTitleDetail {
  label: string;
  full: string;
}

function formatHeaderTitle(name: string): ChatHeaderTitleDetail {
  const full = (name || "New Chat").trim() || "New Chat";
  if (full.length <= HEADER_TITLE_MAX_CHARS) {
    return { label: full, full };
  }
  return {
    label: `${full.slice(0, HEADER_TITLE_MAX_CHARS)}…`,
    full,
  };
}

const ChatHeaderTitle: React.FC = () => {
  const { sessions, currentSessionId } = useChatAnywhereSessionsState();
  const currentSession = sessions.find((s) => s.id === currentSessionId);
  const titlePayload = useMemo(
    () => formatHeaderTitle(currentSession?.name || ""),
    [currentSession?.name],
  );

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent<ChatHeaderTitleDetail>(XCLAW_CHAT_HEADER_TITLE_EVENT, {
        detail: titlePayload,
      }),
    );
  }, [titlePayload]);

  return null;
};

export default ChatHeaderTitle;
