import React from "react";
import { IconButton } from "@agentscope-ai/design";
import { History, ListPlus } from "lucide-react";
import { useChatAnywhereSessions } from "@agentscope-ai/chat";
import { useTranslation } from "react-i18next";
import { Flex, Tooltip } from "antd";

const ICON_PX = 20;

const ChatActionGroup: React.FC<{
  onOpenHistory: () => void;
}> = ({ onOpenHistory }) => {
  const { t } = useTranslation();
  const { createSession } = useChatAnywhereSessions();

  const renderIcon = (node: React.ReactNode) => (
    <span
      style={{
        width: ICON_PX,
        height: ICON_PX,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flex: "0 0 auto",
      }}
    >
      {node}
    </span>
  );

  return (
    <Flex gap={12} align="center">
      <Tooltip title={t("会话记录")} mouseEnterDelay={0.5}>
        <IconButton
          bordered={false}
          icon={renderIcon(
            <History
              color="currentColor"
              strokeWidth={1}
            />,
          )}
          onClick={onOpenHistory}
        />
      </Tooltip>
      <Tooltip title={t("新建会话")} mouseEnterDelay={0.5}>
        <IconButton
          bordered={false}
          icon={renderIcon(
            <ListPlus
              color="currentColor"
              strokeWidth={1}
              style={{ width: "100%", height: "100%" }}
            />,
          )}
          onClick={() => createSession()}
        />
      </Tooltip>
    </Flex>
  );
};

export default ChatActionGroup;
