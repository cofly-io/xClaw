import React from "react";
import { Spin } from "antd";
import { useTranslation } from "react-i18next";
import styles from "./index.module.less";

interface ChatLoadingOverlayProps {
  visible: boolean;
}

const ChatLoadingOverlay: React.FC<ChatLoadingOverlayProps> = ({ visible }) => {
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.content}>
        <Spin size="large" />
        <div className={styles.text}>
          {t("chat.loadingSession", "加载对话中...")}
        </div>
      </div>
    </div>
  );
};

export default ChatLoadingOverlay;
