import { Layout } from "antd";
import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
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
import ToolsPage from "../../pages/Agent/Tools";
import WorkspacePage from "../../pages/Agent/Workspace";
import MCPPage from "../../pages/Agent/MCP";
import ModelsPage from "../../pages/Settings/Models";
import EnvironmentsPage from "../../pages/Settings/Environments";
import LoginPage from "../../pages/Login";
import SecurityPage from "../../pages/Settings/Security";
import TokenUsagePage from "../../pages/Settings/TokenUsage";

const { Content } = Layout;

const pathToKey: Record<string, string> = {
  "/chat": "chat",
  "/channels": "channels",
  "/sessions": "sessions",
  "/cron-jobs": "cron-jobs",
  "/heartbeat": "heartbeat",
  "/skills": "skills",
  "/tools": "tools",
  "/mcp": "mcp",
  "/workspace": "workspace",
  "/agents": "agents",
  "/models": "models",
  "/environments": "environments",
  "/agent-config": "agent-config",
  "/security": "security",
  "/token-usage": "token-usage",
};

export default function MainLayout() {
  const location = useLocation();
  const currentPath = location.pathname;
  const selectedKey = pathToKey[currentPath] || "chat";
  const isChatPage = currentPath === "/" || currentPath.startsWith("/chat");

  const token = localStorage.getItem("supos_token");
  const user = localStorage.getItem("supos_user");
  const [isAuthenticated, setIsAuthenticated] = useState(!!(token && user));
  const [locked, setLocked] = useState(false);

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
    <Layout className={styles.mainLayout} style={{ background: '#f0f5ff' }}>
      <Sidebar selectedKey={selectedKey} />
      <Layout style={{ background: '#f0f5ff' }}>
        <Header selectedKey={selectedKey} onLock={() => setLocked(true)} />
        <Content className="page-container">
          <ConsoleCronBubble />
          <div className="page-content">
            <div
              style={{
                display: isChatPage ? undefined : "none",
                height: "100%",
              }}
            >
              <Chat />
            </div>
            {!isChatPage && (
              <Routes>
                <Route path="/channels" element={<ChannelsPage />} />
                <Route path="/sessions" element={<SessionsPage />} />
                <Route path="/cron-jobs" element={<CronJobsPage />} />
                <Route path="/heartbeat" element={<HeartbeatPage />} />
                <Route path="/skills" element={<SkillsPage />} />
                <Route path="/tools" element={<ToolsPage />} />
                <Route path="/mcp" element={<MCPPage />} />
                <Route path="/workspace" element={<WorkspacePage />} />
                <Route path="/models" element={<ModelsPage />} />
                <Route path="/environments" element={<EnvironmentsPage />} />
                <Route path="/agent-config" element={<AgentConfigPage />} />
                <Route path="/security" element={<SecurityPage />} />
                <Route path="/token-usage" element={<TokenUsagePage />} />
              </Routes>
            )}
          </div>
        </Content>
      </Layout>
    </Layout>
    </>
  );
}
