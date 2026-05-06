import { Layout, Space, Button, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Book, HelpCircle, Lock, LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./index.module.less";
import {
  type ChatHeaderTitleDetail,
  XCLAW_CHAT_HEADER_TITLE_EVENT,
} from "../pages/Chat/components/ChatHeaderTitle";

const { Header: AntHeader } = Layout;

// Navigation URLs
const NAV_URLS = {
  docs: "https://xclaw.agentscope.io/docs/intro",
  faq: "https://xclaw.agentscope.io/docs/faq",
  changelog: "https://github.com/agentscope-ai/xClaw/releases",
  github: "https://github.com/agentscope-ai/xClaw",
} as const;

interface HeaderProps {
  onLock: () => void;
}

export default function Header({ onLock }: HeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [chatHeaderTitle, setChatHeaderTitle] =
    useState<ChatHeaderTitleDetail | null>(null);
  const isChatRoute =
    location.pathname === "/chat" || location.pathname.startsWith("/chat/");

  useEffect(() => {
    const onTitle = (e: Event) => {
      const detail = (e as CustomEvent<ChatHeaderTitleDetail>).detail;
      setChatHeaderTitle(
        detail?.label
          ? { label: detail.label, full: detail.full || detail.label }
          : null,
      );
    };
    window.addEventListener(XCLAW_CHAT_HEADER_TITLE_EVENT, onTitle);
    return () => window.removeEventListener(XCLAW_CHAT_HEADER_TITLE_EVENT, onTitle);
  }, []);

  useEffect(() => {
    if (!isChatRoute) setChatHeaderTitle(null);
  }, [isChatRoute]);

  const handleNavClick = (url: string) => {
    if (url) {
      const pywebview = (window as any).pywebview;
      if (pywebview && pywebview.api) {
        pywebview.api.open_external_link(url);
      } else {
        window.open(url, "_blank");
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("supos_token");
    localStorage.removeItem("supos_user");
    localStorage.removeItem("supos_locked");
    navigate("/login");
  };

  return (
    <AntHeader className={styles.header}>
      <div className={styles.headerCenter}>
        {isChatRoute && chatHeaderTitle?.label ? (
          <span
            className={styles.headerTitle}
            title={chatHeaderTitle.full}
          >
            {chatHeaderTitle.label}
          </span>
        ) : null}
      </div>
      <Space size="middle">
        <Tooltip title={t("header.changelog")}>
          <Button
            icon={<FileText />}
            type="text"
            style={{ fontSize: "14px" }}
            onClick={() => handleNavClick(NAV_URLS.changelog)}
          >
            {t("header.changelog")}
          </Button>
        </Tooltip>
        <Tooltip title={t("header.docs")}>
          <Button
            icon={<Book />}
            type="text"
            style={{ fontSize: "14px" }}
            onClick={() => handleNavClick(NAV_URLS.docs)}
          >
            {t("header.docs")}
          </Button>
        </Tooltip>
        <Tooltip title={t("header.faq")}>
          <Button
            icon={<HelpCircle size={14} />}
            type="text"
            style={{ fontSize: "14px" }}
            onClick={() => handleNavClick(NAV_URLS.faq)}
          >
            {t("header.faq")}
          </Button>
        </Tooltip>
        <Tooltip title={t("header.lock", "锁屏")}>
          <Button
            icon={<Lock />}
            type="text"
            onClick={onLock}
            style={{ fontSize: "14px" }}
          />
        </Tooltip>
        <Tooltip title={t("header.logout", "退出")}>
          <Button
            icon={<LogOut />}
            type="text"
            onClick={handleLogout}
            style={{ fontSize: "12px", fontWeight: "400", color: "#ff4d4f" }}
          />
        </Tooltip>
      </Space>
    </AntHeader>
  );
}
