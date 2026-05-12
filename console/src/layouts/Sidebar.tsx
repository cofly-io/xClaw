import {
  Layout,
  Button,
  Modal,
  Input,
  Form,
  message,
  Tooltip,
} from "antd";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Ellipsis, MessageSquarePlus, SquarePlus } from "lucide-react";
import {
  SparkChatTabFill,
  SparkExitFullscreenLine,
  SparkSearchUserLine,
} from "@agentscope-ai/icons";
import { clearAuthToken } from "../api/config";
import { authApi } from "../api/modules/auth";
import styles from "./index.module.less";
import { useTheme } from "../contexts/ThemeContext";
import AgentSelector from "../components/AgentSelector";
import { requestNewChatSessionFromShell } from "../pages/Chat/chatNewSessionBridge";
import SidebarSessionList from "../pages/Chat/components/SidebarSessionList";

const { Sider } = Layout;

const MOBILE_SIDEBAR_QUERY = "(max-width: 768px)";

function isMobileSidebarViewport() {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(MOBILE_SIDEBAR_QUERY).matches
  );
}

interface SidebarProps {
  onOpenSettingsMore: () => void;
}

export default function Sidebar({ onOpenSettingsMore }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [authEnabled, setAuthEnabled] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountForm] = Form.useForm();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(isMobileSidebarViewport);
  const [suposUsername, setSuposUsername] = useState("");
  const chatRouteActive = location.pathname.startsWith("/chat");
  const navIconProps = {
    size: 16,
    strokeWidth: 1.8,
    absoluteStrokeWidth: true as const,
    color: "#707070",
    className: styles.unifiedNavIcon,
  };

  useEffect(() => {
    authApi
      .getStatus()
      .then((res) => setAuthEnabled(res.enabled))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const readSuposUser = () => {
      try {
        const raw = localStorage.getItem("supos_user");
        if (!raw) {
          setSuposUsername("");
          return;
        }
        const parsed = JSON.parse(raw);
        setSuposUsername(String(parsed?.username || ""));
      } catch {
        setSuposUsername("");
      }
    };

    readSuposUser();
    window.addEventListener("storage", readSuposUser);
    return () => window.removeEventListener("storage", readSuposUser);
  }, [location.pathname]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }

    const mediaQuery = window.matchMedia(MOBILE_SIDEBAR_QUERY);
    const syncMobileSidebar = () => {
      setIsMobile(mediaQuery.matches);
      if (mediaQuery.matches) {
        setCollapsed(true);
      }
    };

    syncMobileSidebar();
    mediaQuery.addEventListener("change", syncMobileSidebar);

    return () => {
      mediaQuery.removeEventListener("change", syncMobileSidebar);
    };
  }, []);

  const handleUpdateProfile = async (values: {
    currentPassword: string;
    newUsername?: string;
    newPassword?: string;
  }) => {
    const trimmedUsername = values.newUsername?.trim() || undefined;
    const trimmedPassword = values.newPassword?.trim() || undefined;

    if (values.newPassword && !trimmedPassword) {
      message.error(t("account.passwordEmpty"));
      return;
    }

    if (values.newUsername && !trimmedUsername) {
      message.error(t("account.usernameEmpty"));
      return;
    }

    if (!trimmedUsername && !trimmedPassword) {
      message.warning(t("account.nothingToUpdate"));
      return;
    }

    setAccountLoading(true);
    try {
      await authApi.updateProfile(
        values.currentPassword,
        trimmedUsername,
        trimmedPassword,
      );
      message.success(t("account.updateSuccess"));
      setAccountModalOpen(false);
      accountForm.resetFields();
      clearAuthToken();
      window.location.href = "/login";
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : "";
      let msg = t("account.updateFailed");
      if (raw.includes("password is incorrect")) {
        msg = t("account.wrongPassword");
      } else if (raw.includes("Nothing to update")) {
        msg = t("account.nothingToUpdate");
      } else if (raw.includes("cannot be empty")) {
        msg = t("account.nothingToUpdate");
      } else if (raw) {
        msg = raw;
      }
      message.error(msg);
    } finally {
      setAccountLoading(false);
    }
  };

  const collapsedNavItems = [
    {
      key: "new-chat",
      icon: <MessageSquarePlus {...navIconProps} />,
      action: () => {
        requestNewChatSessionFromShell(location.pathname, (to) => navigate(to));
      },
      label: t("chat.newChat"),
    },
  ];

  const siderWidth = collapsed ? (isMobile ? 56 : 72) : 255;

  return (
    <>
      {/* Dot grip — fixed on sidebar right edge */}
      <div
        className={`${styles.dotGrip} ${collapsed ? styles.dotGripCollapsed : ""}`}
        onClick={() => setCollapsed(!collapsed)}
      >
        {[0, 1, 2, 3, 4, 5].map((col) => (
          <div key={col} className={styles.dotRow}>
            {[0, 1].map((row) => (
              <div key={row} className={styles.dot} />
            ))}
          </div>
        ))}
      </div>
      <Sider
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={siderWidth}
        className={`${styles.sider}${isDark ? ` ${styles.siderDark}` : ""}`}
      >
        <div className={styles.sidebarMain}>
          {!collapsed && (
            <div className={styles.logoWrapper} onClick={() => navigate("/chat")}>
              <img
                src={
                  isDark
                    ? `${import.meta.env.BASE_URL}dark-logo.png`
                    : `${import.meta.env.BASE_URL}logo.png`
                }
                alt="xClaw"
                className={styles.logoImg}
              />
            </div>
          )}
          {!collapsed && (
            <div className={styles.agentSelectorContainer}>
              <AgentSelector hideLabel />
              <button
                type="button"
                className={`${styles.stickyChatButton}${
                  chatRouteActive ? ` ${styles.stickyChatButtonActive}` : ""
                }`}
                onClick={() => navigate("/chat")}
              >
                <SparkChatTabFill size={16} />
                <span>{t("nav.chat")}</span>
              </button>
            </div>
          )}
          {collapsed ? (
            <nav className={styles.collapsedNav}>
              {collapsedNavItems.map((item) => (
                <Tooltip
                  key={item.key}
                  title={item.label}
                  placement="right"
                  overlayInnerStyle={{
                    background: "rgba(0,0,0,0.75)",
                    color: "#fff",
                  }}
                >
                  <button
                    className={styles.collapsedNavItem}
                    onClick={item.action}
                  >
                    {item.icon}
                  </button>
                </Tooltip>
              ))}
            </nav>
          ) : (
            <div className={styles.sideMenu}>
              <Button
                type="text"
                className={styles.sidebarActionBtn}
                icon={<SquarePlus {...navIconProps} />}
                onClick={() =>
                  requestNewChatSessionFromShell(location.pathname, (to) =>
                    navigate(to),
                  )
                }
              >
                {t("chat.newChat")}
              </Button>
            </div>
          )}
          <SidebarSessionList collapsed={collapsed} />
        </div>

        {authEnabled && !collapsed && (
          <div className={styles.authActions}>
            <Button
              type="text"
              icon={<SparkSearchUserLine size={16} />}
              onClick={() => {
                accountForm.resetFields();
                setAccountModalOpen(true);
              }}
              block
              className={`${styles.authBtn} ${
                collapsed ? styles.authBtnCollapsed : ""
              }`}
            >
              {!collapsed && t("account.title")}
            </Button>
            <Button
              type="text"
              icon={<SparkExitFullscreenLine size={16} />}
              onClick={() => {
                clearAuthToken();
                window.location.href = "/login";
              }}
              block
              className={`${styles.authBtn} ${
                collapsed ? styles.authBtnCollapsed : ""
              }`}
            >
              {!collapsed && t("login.logout")}
            </Button>
          </div>
        )}

        <div className={styles.settingsMoreDock}>
          {collapsed ? (
            <Tooltip title={t("nav.settings")} placement="right">
              <button
                className={styles.collapsedNavItem}
                onClick={onOpenSettingsMore}
              >
                <Ellipsis {...navIconProps} />
              </button>
            </Tooltip>
          ) : (
            <Button
              type="text"
              className={`${styles.sidebarActionBtn} ${styles.settingsMoreEntryBottom}`}
              onClick={onOpenSettingsMore}
            >
              <span className={styles.settingsBottomContent}>
                {suposUsername && (
                  <span className={styles.settingsUserMeta}>
                    <div className={styles.settingsUserAvatar} />
                    <span className={styles.settingsUsername}>{suposUsername}</span>
                  </span>
                )}
                <span className={styles.settingsLabelWithIcon}>
                  <Ellipsis {...navIconProps} />
                  <span>{t("nav.settings")}</span>
                </span>
              </span>
            </Button>
          )}
        </div>

        <Modal
          open={accountModalOpen}
          onCancel={() => setAccountModalOpen(false)}
          title={t("account.title")}
          footer={null}
          destroyOnHidden
          centered
        >
          <Form
            form={accountForm}
            layout="vertical"
            onFinish={handleUpdateProfile}
          >
            <Form.Item
              name="currentPassword"
              label={t("account.currentPassword")}
              rules={[
                { required: true, message: t("account.currentPasswordRequired") },
              ]}
            >
              <Input.Password />
            </Form.Item>
            <Form.Item name="newUsername" label={t("account.newUsername")}>
              <Input placeholder={t("account.newUsernamePlaceholder")} />
            </Form.Item>
            <Form.Item name="newPassword" label={t("account.newPassword")}>
              <Input.Password placeholder={t("account.newPasswordPlaceholder")} />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label={t("account.confirmPassword")}
              dependencies={["newPassword"]}
              rules={[
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value && !getFieldValue("newPassword")) {
                      return Promise.resolve();
                    }
                    if (value === getFieldValue("newPassword")) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(t("account.passwordMismatch")),
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder={t("account.confirmPasswordPlaceholder")}
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={accountLoading}
                block
              >
                {t("account.save")}
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </Sider>
    </>
  );
}
