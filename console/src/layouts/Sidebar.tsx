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
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Ellipsis, MessageSquare, SquarePlus } from "lucide-react";
import {
  SparkExitFullscreenLine,
  SparkSearchUserLine,
} from "@agentscope-ai/icons";
import { clearAuthToken } from "../api/config";
import { authApi } from "../api/modules/auth";
import styles from "./index.module.less";
import { useTheme } from "../contexts/ThemeContext";
import AgentSelector from "../components/AgentSelector";
import sessionApi from "../pages/Chat/sessionApi";

const { Sider } = Layout;

interface SidebarProps {
  selectedKey: string;
  onOpenSettingsMore: () => void;
}

export default function Sidebar({
  selectedKey,
  onOpenSettingsMore,
}: SidebarProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [authEnabled, setAuthEnabled] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountForm] = Form.useForm();
  const [collapsed, setCollapsed] = useState(false);
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
      icon: <SquarePlus {...navIconProps} />,
      action: () => {
        sessionApi.createSession({});
        navigate("/chat");
      },
      label: t("chat.newChat"),
    },
    {
      key: "chat",
      icon: <MessageSquare {...navIconProps} />,
      action: () => navigate("/chat"),
      label: t("nav.chat"),
    },
  ];

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
        width={255}
        className={`${styles.sider}${isDark ? ` ${styles.siderDark}` : ""}`}
      >
        <div className={styles.sidebarMain}>
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
          {!collapsed && (
            <div className={styles.agentSelectorContainer}>
              <AgentSelector hideLabel />
            </div>
          )}
          {collapsed ? (
            <nav className={styles.collapsedNav}>
              {collapsedNavItems.map((item) => {
                const isActive = selectedKey === item.key;
                return (
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
                      className={`${styles.collapsedNavItem} ${
                        isActive ? styles.collapsedNavItemActive : ""
                      }`}
                      onClick={item.action}
                    >
                      {item.icon}
                    </button>
                  </Tooltip>
                );
              })}
            </nav>
          ) : (
            <div className={styles.sideMenu}>
              <Button
                type="text"
                className={styles.sidebarActionBtn}
                icon={<SquarePlus {...navIconProps} />}
                onClick={() => {
                  sessionApi.createSession({});
                  navigate("/chat");
                }}
              >
                {t("chat.newChat")}
              </Button>
              <Button
                type="text"
                className={`${styles.sidebarActionBtn} ${
                  selectedKey === "chat" ? styles.sidebarActionBtnActive : ""
                }`}
                icon={<MessageSquare {...navIconProps} />}
                onClick={() => navigate("/chat")}
              >
                {t("nav.chat")}
              </Button>
            </div>
          )}
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
              icon={<Ellipsis {...navIconProps} />}
              onClick={onOpenSettingsMore}
            >
              {t("nav.settings")}
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
