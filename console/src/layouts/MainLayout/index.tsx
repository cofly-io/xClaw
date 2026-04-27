import { Layout, Modal } from "antd";
import { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Activity,
  Bot,
  Braces,
  Cpu,
  FolderOpen,
  Hammer,
  ListTodo,
  Play,
  Radio,
  Save,
  Sparkles,
  SquareTerminal,
  type LucideIcon,
} from "lucide-react";
import Sidebar from "../Sidebar";
import Header from "../Header";
import ConsoleCronBubble from "../../components/ConsoleCronBubble";
import LockScreen from "../../components/LockScreen";
import styles from "../index.module.less";
import Chat from "../../pages/Chat";
import ChannelsPage from "../../pages/Control/Channels";
import CronJobsPage from "../../pages/Control/CronJobs";
import HeartbeatPage from "../../pages/Control/Heartbeat";
import AgentConfigPage from "../../pages/Agent/Config";
import SkillsHubPage from "../../pages/Agent/SkillsHub";
import ToolsPage from "../../pages/Agent/Tools";
import WorkspacePage from "../../pages/Agent/Workspace";
import MCPPage from "../../pages/Agent/MCP";
import ACPPage from "../../pages/Agent/ACP";
import ModelsPage from "../../pages/Settings/Models";
import EnvironmentsPage from "../../pages/Settings/Environments";
import LoginPage from "../../pages/Login";
import SecurityPage from "../../pages/Settings/Security";
import TokenUsagePage from "../../pages/Settings/TokenUsage";
import AgentsPage from "../../pages/Settings/Agents";
import VoiceTranscriptionPage from "../../pages/Settings/VoiceTranscription";
import BackupsPage from "../../pages/Settings/Backups";
import { KEY_TO_LABEL } from "../constants";

const { Content } = Layout;
const ALL_MORE_MENU_KEYS = [
  "channels",
  "cron-jobs",
  "heartbeat",
  "workspace",
  "skills",
  "tools",
  "mcp",
  "acp",
  "agent-config",
  "agents",
  "models",
  "environments",
  "security",
  "token-usage",
  "backups",
  "voice-transcription",
] as const;

const MORE_MENU_KEYS = [
  "channels",
  "cron-jobs",
  "heartbeat",
  "workspace",
  "skills",
  "tools",
  "acp",
  "agent-config",
  "agents",
  "models",
  "environments",
  "backups",
] as const satisfies readonly MoreMenuKey[];

type MoreMenuKey = (typeof ALL_MORE_MENU_KEYS)[number];
type VisibleMoreMenuKey = (typeof MORE_MENU_KEYS)[number];
const MORE_MENU_LABEL_OVERRIDE: Partial<Record<VisibleMoreMenuKey, string>> = {
  "cron-jobs": "任务",
  "agent-config": "运行",
  agents: "智能体",
  environments: "变量",
};
const MORE_MENU_ICON_MAP: Record<VisibleMoreMenuKey, LucideIcon> = {
  channels: Radio,
  "cron-jobs": ListTodo,
  heartbeat: Activity,
  workspace: FolderOpen,
  skills: Sparkles,
  tools: Hammer,
  acp: SquareTerminal,
  "agent-config": Play,
  agents: Bot,
  models: Cpu,
  environments: Braces,
  backups: Save,
};

export default function MainLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const currentPath = location.pathname;

  const token = localStorage.getItem("supos_token");
  const user = localStorage.getItem("supos_user");
  const [isAuthenticated, setIsAuthenticated] = useState(!!(token && user));
  const [locked, setLocked] = useState(false);
  const [moreModalOpen, setMoreModalOpen] = useState(false);
  const [moreActiveKey, setMoreActiveKey] = useState<MoreMenuKey>("channels");
  const [mountedMoreKeys, setMountedMoreKeys] = useState<Set<MoreMenuKey>>(
    () => new Set(["channels"]),
  );

  const renderMorePage = (key: MoreMenuKey) => {
    switch (key) {
      case "channels":
        return <ChannelsPage />;
      case "cron-jobs":
        return <CronJobsPage />;
      case "heartbeat":
        return <HeartbeatPage />;
      case "workspace":
        return <WorkspacePage />;
      case "skills":
        return <SkillsHubPage />;
      case "tools":
        return <ToolsPage />;
      case "mcp":
        return <MCPPage />;
      case "acp":
        return <ACPPage />;
      case "agent-config":
        return <AgentConfigPage />;
      case "agents":
        return <AgentsPage />;
      case "models":
        return <ModelsPage />;
      case "environments":
        return <EnvironmentsPage />;
      case "backups":
        return <BackupsPage />;
      case "security":
        return <SecurityPage />;
      case "token-usage":
        return <TokenUsagePage />;
      case "voice-transcription":
        return <VoiceTranscriptionPage />;
      default:
        return null;
    }
  };

  const mountedPages = useMemo(() => {
    return MORE_MENU_KEYS.filter((key) => mountedMoreKeys.has(key)).map((key) => (
      <div
        key={key}
        style={{
          display: moreActiveKey === key ? "block" : "none",
          height: "100%",
        }}
      >
        {renderMorePage(key)}
      </div>
    ));
  }, [mountedMoreKeys, moreActiveKey]);

  useEffect(() => {
    const t = localStorage.getItem("supos_token");
    const u = localStorage.getItem("supos_user");
    setIsAuthenticated(!!(t && u));
  }, [currentPath]);

  if (!isAuthenticated && currentPath !== "/login") {
    return <Navigate to="/login" replace />;
  }
  if (isAuthenticated && currentPath === "/login") {
    return <Navigate to="/chat" replace />;
  }
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <>
      {locked && <LockScreen onUnlock={() => setLocked(false)} />}
      <Layout className={styles.mainLayout} style={{ background: "#f0f5ff" }}>
        <Sidebar onOpenSettingsMore={() => setMoreModalOpen(true)} />
        <Layout className={styles.pageContainer} style={{ background: "#f0f5ff" }}>
          <Header onLock={() => setLocked(true)} />
          <Content className="page-container">
            <ConsoleCronBubble />
            <div className="page-content">
              <Routes>
                <Route path="/" element={<Navigate to="/chat" replace />} />
                <Route path="/chat/*" element={<Chat />} />
                <Route path="/channels" element={<ChannelsPage />} />
                <Route path="/cron-jobs" element={<CronJobsPage />} />
                <Route path="/heartbeat" element={<HeartbeatPage />} />
                <Route path="/skills" element={<SkillsHubPage />} />
                <Route
                  path="/skill-pool"
                  element={<Navigate to="/skills?tab=pool" replace />}
                />
                <Route path="/tools" element={<ToolsPage />} />
                <Route path="/mcp" element={<MCPPage />} />
                <Route path="/acp" element={<ACPPage />} />
                <Route path="/ACP" element={<Navigate to="/acp" replace />} />
                <Route path="/workspace" element={<WorkspacePage />} />
                <Route path="/agents" element={<AgentsPage />} />
                <Route path="/models" element={<ModelsPage />} />
                <Route path="/environments" element={<EnvironmentsPage />} />
                <Route path="/agent-config" element={<AgentConfigPage />} />
                <Route path="/backups" element={<BackupsPage />} />
                <Route path="/security" element={<SecurityPage />} />
                <Route path="/token-usage" element={<TokenUsagePage />} />
                <Route
                  path="/voice-transcription"
                  element={<VoiceTranscriptionPage />}
                />
              </Routes>
            </div>
          </Content>
        </Layout>
      </Layout>
      <Modal
        open={moreModalOpen}
        onCancel={() => setMoreModalOpen(false)}
        footer={null}
        width="62vw"
        centered
        title={t("nav.settings")}
        className={styles.settingsMoreModal}
      >
        <div className={styles.settingsMoreModalBody}>
          <div className={styles.settingsMoreSidebar}>
            {MORE_MENU_KEYS.map((key) => (
              <button
                key={key}
                className={`${styles.settingsMoreItem} ${
                  moreActiveKey === key ? styles.settingsMoreItemActive : ""
                }`}
                onClick={() => {
                  setMoreActiveKey(key);
                  setMountedMoreKeys((prev) => {
                    if (prev.has(key)) return prev;
                    const next = new Set(prev);
                    next.add(key);
                    return next;
                  });
                }}
              >
                <span className={styles.settingsMoreItemInner}>
                  {(() => {
                    const Icon = MORE_MENU_ICON_MAP[key];
                    return (
                      <Icon
                        size={15}
                        strokeWidth={1.6}
                        absoluteStrokeWidth
                        className={styles.settingsMoreItemIcon}
                      />
                    );
                  })()}
                  <span>
                    {MORE_MENU_LABEL_OVERRIDE[key] ?? t(KEY_TO_LABEL[key] ?? key)}
                  </span>
                </span>
              </button>
            ))}
          </div>
          <div className={styles.settingsMoreContent}>{mountedPages}</div>
        </div>
      </Modal>
    </>
  );
}
