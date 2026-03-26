import { Layout, Space } from "antd";
import { useTranslation } from "react-i18next";
import { FileText, Book, HelpCircle, Lock, LogOut } from "lucide-react";
import { Button, Tooltip } from "@agentscope-ai/design";
import { useNavigate } from "react-router-dom";
import styles from "./index.module.less";

const { Header: AntHeader } = Layout;

// Navigation URLs
const NAV_URLS = {
  docs: "https://copaw.agentscope.io/docs/intro",
  faq: "https://copaw.agentscope.io/docs/faq",
  changelog: "https://github.com/agentscope-ai/CoPaw/releases",
  github: "https://github.com/agentscope-ai/CoPaw",
} as const;

const keyToLabel: Record<string, string> = {
  chat: "nav.chat",
  channels: "nav.channels",
  sessions: "nav.sessions",
  "cron-jobs": "nav.cronJobs",
  heartbeat: "nav.heartbeat",
  skills: "nav.skills",
  tools: "nav.tools",
  mcp: "nav.mcp",
  "agent-config": "nav.agentConfig",
  workspace: "nav.workspace",
  models: "nav.models",
  environments: "nav.environments",
  security: "nav.security",
  "token-usage": "nav.tokenUsage",
};

interface HeaderProps {
  selectedKey: string;
  onLock: () => void;
}

export default function Header({ selectedKey, onLock }: HeaderProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
      <span className={styles.headerTitle}>
        {t(keyToLabel[selectedKey] || "nav.chat")}
      </span>
      <Space size="middle">
        <Tooltip title={t("header.changelog")}>
          <Button
            icon={<FileText />}
            type="text"
            style={{ fontSize: '14px' }}
            onClick={() => handleNavClick(NAV_URLS.changelog)}
          >
            {t("header.changelog")}
          </Button>
        </Tooltip>
        <Tooltip title={t("header.docs")}>
          <Button
            icon={<Book />}
            type="text"
            style={{ fontSize: '14px' }}
            onClick={() => handleNavClick(NAV_URLS.docs)}
          >
            {t("header.docs")}
          </Button>
        </Tooltip>
        <Tooltip title={t("header.faq")}>
          <Button
            icon={<HelpCircle size={14} />}
            type="text"
            style={{ fontSize: '14px' }}
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
            style={{ fontSize: '14px' }}
          />
        </Tooltip>
        <Tooltip title={t("header.logout", "退出")}>
          <Button
            icon={<LogOut />}
            type="text"
            onClick={handleLogout}
            style={{ fontSize: '12px', fontWeight: '400', color: '#ff4d4f' }}
          />
        </Tooltip>
      </Space>
    </AntHeader>
  );
}
