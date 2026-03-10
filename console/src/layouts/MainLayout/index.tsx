import { Layout } from "antd";
import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar";
import Header from "../Header";
import ConsoleCronBubble from "../../components/ConsoleCronBubble";
import styles from "../index.module.less";
import Chat from "../../pages/Chat";
import ChannelsPage from "../../pages/Control/Channels";
import SessionsPage from "../../pages/Control/Sessions";
import CronJobsPage from "../../pages/Control/CronJobs";
import HeartbeatPage from "../../pages/Control/Heartbeat";
import AgentConfigPage from "../../pages/Agent/Config";
import SkillsPage from "../../pages/Agent/Skills";
import WorkspacePage from "../../pages/Agent/Workspace";
import MCPPage from "../../pages/Agent/MCP";
import ModelsPage from "../../pages/Settings/Models";
import EnvironmentsPage from "../../pages/Settings/Environments";
import LoginPage from "../../pages/Login";

const { Content } = Layout;

const pathToKey: Record<string, string> = {
  "/chat": "chat",
  "/channels": "channels",
  "/sessions": "sessions",
  "/cron-jobs": "cron-jobs",
  "/heartbeat": "heartbeat",
  "/skills": "skills",
  "/mcp": "mcp",
  "/workspace": "workspace",
  "/agents": "agents",
  "/models": "models",
  "/environments": "environments",
  "/agent-config": "agent-config",
};

export default function MainLayout() {
  const location = useLocation();
  const currentPath = location.pathname;
  const selectedKey = pathToKey[currentPath] || "chat";

  // 同步读取，避免闪烁
  const token = localStorage.getItem("supos_token");
  const user = localStorage.getItem("supos_user");
  const [isAuthenticated, setIsAuthenticated] = useState(!!(token && user));

  useEffect(() => {
    const t = localStorage.getItem("supos_token");
    const u = localStorage.getItem("supos_user");
    setIsAuthenticated(!!(t && u));
  }, [currentPath]);

  // 路由守卫：未登录且不是登录页，跳转登录
  if (!isAuthenticated && currentPath !== "/login") {
    return <Navigate to="/login" replace />;
  }

  // 已登录访问登录页，跳转主页
  if (isAuthenticated && currentPath === "/login") {
    return <Navigate to="/chat" replace />;
  }

  // 未登录，显示登录页
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  // 已登录，显示主布局
  return (
    <Layout className={styles.mainLayout} style={{ background: '#f0f5ff' }}>
      <Sidebar selectedKey={selectedKey} />
      <Layout style={{ background: '#f0f5ff' }}>
        <Header selectedKey={selectedKey} />
        <Content className="page-container">
          <ConsoleCronBubble />
          <div className="page-content">
            <Routes>
              <Route path="/chat" element={<Chat />} />
              <Route path="/channels" element={<ChannelsPage />} />
              <Route path="/sessions" element={<SessionsPage />} />
              <Route path="/cron-jobs" element={<CronJobsPage />} />
              <Route path="/heartbeat" element={<HeartbeatPage />} />
              <Route path="/skills" element={<SkillsPage />} />
              <Route path="/mcp" element={<MCPPage />} />
              <Route path="/workspace" element={<WorkspacePage />} />
              <Route path="/models" element={<ModelsPage />} />
              <Route path="/environments" element={<EnvironmentsPage />} />
              <Route path="/agent-config" element={<AgentConfigPage />} />
              <Route path="/login" element={<Navigate to="/chat" replace />} />
              <Route path="/" element={<Navigate to="/chat" replace />} />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
