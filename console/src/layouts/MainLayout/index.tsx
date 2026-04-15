import { Layout, Modal } from "antd";
import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Sidebar from "../Sidebar";
import Header from "../Header";
import ConsoleCronBubble from "../../components/ConsoleCronBubble";
import LockScreen from "../../components/LockScreen";
import styles from "../index.module.less";
import Chat from "../../pages/Chat";
import ChannelsPage from "../../pages/Control/Channels";
import SessionsPage from "../../pages/Control/Sessions";
import CronJobsPage from "../../pages/Control/CronJobs";
import HeartbeatPage from "../../pages/Control/Heartbeat";
import AgentConfigPage from "../../pages/Agent/Config";
import SkillsPage from "../../pages/Agent/Skills";
import SkillPoolPage from "../../pages/Agent/SkillPool";
import ToolsPage from "../../pages/Agent/Tools";
import WorkspacePage from "../../pages/Agent/Workspace";
import MCPPage from "../../pages/Agent/MCP";
import ModelsPage from "../../pages/Settings/Models";
import EnvironmentsPage from "../../pages/Settings/Environments";
import LoginPage from "../../pages/Login";
import SecurityPage from "../../pages/Settings/Security";
import TokenUsagePage from "../../pages/Settings/TokenUsage";
import AgentsPage from "../../pages/Settings/Agents";
import VoiceTranscriptionPage from "../../pages/Settings/VoiceTranscription";
import { KEY_TO_LABEL } from "../constants";

const { Content } = Layout;

const pathToKey: Record<string, string> = {
  "/chat": "chat",
  "/channels": "channels",
  "/sessions": "sessions",
  "/cron-jobs": "cron-jobs",
  "/heartbeat": "heartbeat",
  "/skills": "skills",
  "/skill-pool": "skill-pool",
  "/tools": "tools",
  "/mcp": "mcp",
  "/workspace": "workspace",
  "/agents": "agents",
  "/models": "models",
  "/environments": "environments",
  "/agent-config": "agent-config",
  "/security": "security",
  "/token-usage": "token-usage",
  "/voice-transcription": "voice-transcription",
};

export default function MainLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const currentPath = location.pathname;
  const selectedKey = pathToKey[currentPath] || "chat";

  const token = localStorage.getItem("supos_token");
  const user = localStorage.getItem("supos_user");
  const [isAuthenticated, setIsAuthenticated] = useState(!!(token && user));
  const [locked, setLocked] = useState(false);
  const [moreModalOpen, setMoreModalOpen] = useState(false);
  const [moreActiveKey, setMoreActiveKey] = useState("channels");

  const moreMenuKeys = [
    "channels",
    "sessions",
    "cron-jobs",
    "heartbeat",
    "workspace",
    "skills",
    "tools",
    "mcp",
    "agent-config",
    "agents",
    "models",
    "skill-pool",
    "environments",
    "security",
    "token-usage",
    "voice-transcription",
  ] as const;

  const moreContentMap: Record<string, React.ReactNode> = {
    channels: <ChannelsPage />,
    sessions: <SessionsPage />,
    "cron-jobs": <CronJobsPage />,
    heartbeat: <HeartbeatPage />,
    skills: <SkillsPage />,
    "skill-pool": <SkillPoolPage />,
    tools: <ToolsPage />,
    mcp: <MCPPage />,
    workspace: <WorkspacePage />,
    agents: <AgentsPage />,
    models: <ModelsPage />,
    environments: <EnvironmentsPage />,
    "agent-config": <AgentConfigPage />,
    security: <SecurityPage />,
    "token-usage": <TokenUsagePage />,
    "voice-transcription": <VoiceTranscriptionPage />,
  };

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
        <Sidebar
          selectedKey={selectedKey}
          onOpenSettingsMore={() => setMoreModalOpen(true)}
        />
        <Layout className={styles.pageContainer} style={{ background: "#f0f5ff" }}>
          <Header onLock={() => setLocked(true)} />
          <Content className="page-container">
            <ConsoleCronBubble />
            <div className="page-content">
              <Routes>
                <Route path="/" element={<Navigate to="/chat" replace />} />
                <Route path="/chat/*" element={<Chat />} />
                <Route path="/channels" element={<ChannelsPage />} />
                <Route path="/sessions" element={<SessionsPage />} />
                <Route path="/cron-jobs" element={<CronJobsPage />} />
                <Route path="/heartbeat" element={<HeartbeatPage />} />
                <Route path="/skills" element={<SkillsPage />} />
                <Route path="/skill-pool" element={<SkillPoolPage />} />
                <Route path="/tools" element={<ToolsPage />} />
                <Route path="/mcp" element={<MCPPage />} />
                <Route path="/workspace" element={<WorkspacePage />} />
                <Route path="/agents" element={<AgentsPage />} />
                <Route path="/models" element={<ModelsPage />} />
                <Route path="/environments" element={<EnvironmentsPage />} />
                <Route path="/agent-config" element={<AgentConfigPage />} />
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
        width="88vw"
        style={{ top: 24 }}
        destroyOnClose
        title={t("nav.settings")}
      >
        <div className={styles.settingsMoreModalBody}>
          <div className={styles.settingsMoreSidebar}>
            {moreMenuKeys.map((key) => (
              <button
                key={key}
                className={`${styles.settingsMoreItem} ${
                  moreActiveKey === key ? styles.settingsMoreItemActive : ""
                }`}
                onClick={() => setMoreActiveKey(key)}
              >
                {t(KEY_TO_LABEL[key] ?? key)}
              </button>
            ))}
          </div>
          <div className={styles.settingsMoreContent}>
            {moreContentMap[moreActiveKey]}
          </div>
        </div>
      </Modal>
    </>
  );
}
