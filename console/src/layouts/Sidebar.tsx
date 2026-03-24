import {
  Layout,
  Menu,
  Button,
  Badge,
  Modal,
  Spin,
  Tooltip,
  Input,
  Form,
  message,
  type MenuProps,
} from "antd";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Copy,
  Check,
  MessageCircle,
  Plug,
  History,
  CalendarClock,
  HeartPulse,
  Zap,
  Wrench,
  Settings,
  Bot,
  Network,
  Globe,
  KeyRound,
  BarChart3,
  Mic,
  LogOut,
  UserCog,
  MessagesSquare,
  Cpu,
  FolderOpen,
} from "lucide-react";
import api from "../api";
import { clearAuthToken } from "../api/config";
import { authApi } from "../api/modules/auth";
import styles from "./index.module.less";
import { useTheme } from "../contexts/ThemeContext";
import {
  PYPI_URL,
  ONE_HOUR_MS,
  DEFAULT_OPEN_KEYS,
  KEY_TO_PATH,
  UPDATE_MD,
  isStableVersion,
  compareVersions,
  getReleaseNotesUrl,
} from "./constants";

const { Sider } = Layout;

interface SidebarProps {
  selectedKey: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const { t } = useTranslation();

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <Tooltip
      title={copied ? t("common.copied", "Copied!") : t("common.copy", "Copy")}
    >
      <Button
        type="text"
        size="small"
        icon={copied ? <Check size={13} /> : <Copy size={13} />}
        onClick={handleCopy}
        className={`${styles.copyBtn} ${
          copied ? styles.copyBtnCopied : styles.copyBtnDefault
        }`}
      />
    </Tooltip>
  );
}

export default function Sidebar({ selectedKey }: SidebarProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { isDark } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState<string[]>(DEFAULT_OPEN_KEYS);
  const [version, setVersion] = useState<string>("");
  const [latestVersion, setLatestVersion] = useState<string>("");
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [updateMarkdown, setUpdateMarkdown] = useState<string>("");
  const [authEnabled, setAuthEnabled] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);
  const [accountForm] = Form.useForm();

  useEffect(() => {
    authApi
      .getStatus()
      .then((res) => setAuthEnabled(res.enabled))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!collapsed) setOpenKeys(DEFAULT_OPEN_KEYS);
  }, [collapsed]);

  useEffect(() => {
    api
      .getVersion()
      .then((res) => setVersion(res?.version ?? ""))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(PYPI_URL)
      .then((res) => res.json())
      .then((data) => {
        const releases = data?.releases ?? {};

        const versionsWithTime = Object.entries(releases)
          .filter(([v]) => isStableVersion(v))
          .map(([v, files]) => {
            const fileList = files as Array<{ upload_time_iso_8601?: string }>;
            const latestUpload = fileList
              .map((f) => f.upload_time_iso_8601)
              .filter(Boolean)
              .sort()
              .pop();
            return { version: v, uploadTime: latestUpload || "" };
          });

        versionsWithTime.sort((a, b) => {
          const timeDiff =
            new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime();
          return timeDiff !== 0
            ? timeDiff
            : compareVersions(b.version, a.version);
        });

        const versions = versionsWithTime.map((v) => v.version);
        const latest = versions[0] ?? data?.info?.version ?? "";

        // Only notify once the latest version is older than 1 hour
        const releaseTime = versionsWithTime.find((v) => v.version === latest)
          ?.uploadTime;
        const isOldEnough =
          !!releaseTime &&
          new Date(releaseTime) <= new Date(Date.now() - ONE_HOUR_MS);

        if (isOldEnough) {
          setLatestVersion(latest);
        } else {
          setLatestVersion("");
        }
      })
      .catch(() => {});
  }, []);

  const hasUpdate =
    !!version &&
    !!latestVersion &&
    compareVersions(latestVersion, version) > 0;

  const handleOpenUpdateModal = () => {
    setUpdateMarkdown("");
    setUpdateModalOpen(true);
    const lang = i18n.language?.startsWith("zh")
      ? "zh"
      : i18n.language?.startsWith("ru")
      ? "ru"
      : "en";
    const faqLang = lang === "zh" ? "zh" : "en";
    const url = `https://copaw.agentscope.io/docs/faq.${faqLang}.md`;
    fetch(url, { cache: "no-cache" })
      .then((res) => (res.ok ? res.text() : Promise.reject()))
      .then((text) => {
        const zhPattern = /###\s*CoPaw如何更新[\s\S]*?(?=\n###|$)/;
        const enPattern = /###\s*How to update CoPaw[\s\S]*?(?=\n###|$)/;
        const match = text.match(faqLang === "zh" ? zhPattern : enPattern);
        setUpdateMarkdown(
          match && lang !== "ru"
            ? match[0].trim()
            : UPDATE_MD[lang] ?? UPDATE_MD.en,
        );
      })
      .catch(() => {
        setUpdateMarkdown(UPDATE_MD[lang] ?? UPDATE_MD.en);
      });
  };

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

  const menuItems: MenuProps["items"] = [
    {
      key: "chat-group",
      label: collapsed ? null : t("nav.chat"),
      icon: collapsed ? <MessagesSquare size={18} /> : null,
      children: [
        {
          key: "chat",
          label: t("nav.chat"),
          icon: <MessageCircle size={15} />,
        },
      ],
    },
    {
      key: "control-group",
      label: collapsed ? null : t("nav.control"),
      icon: collapsed ? <Network size={18} /> : null,
      children: [
        { key: "channels", label: t("nav.channels"), icon: <Plug size={15} /> },
        { key: "sessions", label: t("nav.sessions"), icon: <History size={15} /> },
        { key: "cron-jobs", label: t("nav.cronJobs"), icon: <CalendarClock size={15} /> },
        { key: "heartbeat", label: t("nav.heartbeat"), icon: <HeartPulse size={15} /> },
      ],
    },
    {
      key: "agent-group",
      label: collapsed ? null : t("nav.agent"),
      icon: collapsed ? <Bot size={18} /> : null,
      children: [
        { key: "workspace", label: t("nav.workspace"), icon: <FolderOpen size={15} /> },
        { key: "skills", label: t("nav.skills"), icon: <Zap size={15} /> },
        { key: "tools", label: t("nav.tools"), icon: <Wrench size={15} /> },
        { key: "mcp", label: t("nav.mcp"), icon: <Cpu size={15} /> },
        { key: "agent-config", label: t("nav.agentConfig"), icon: <Settings size={15} /> },
      ],
    },
    {
      key: "settings-group",
      label: collapsed ? null : t("nav.settings"),
      icon: collapsed ? <Settings size={18} /> : null,
      children: [
        { key: "agents", label: t("nav.agents"), icon: <Bot size={15} /> },
        { key: "models", label: t("nav.models"), icon: <Globe size={15} /> },
        { key: "environments", label: t("nav.environments"), icon: <KeyRound size={15} /> },
        // { key: "security", label: t("nav.security"), icon: <Shield size={15} /> },
        { key: "token-usage", label: t("nav.tokenUsage"), icon: <BarChart3 size={15} /> },
        { key: "voice-transcription", label: t("nav.voiceTranscription"), icon: <Mic size={15} /> },
      ],
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
        width={220}
        className={`${styles.sider}${isDark ? ` ${styles.siderDark}` : ""}`}
      >
        <div className={styles.siderTop}>
          {!collapsed && (
            <div className={styles.logoWrapper}>
              <img
                src={
                  isDark
                    ? `${import.meta.env.BASE_URL}dark-logo.png`
                    : `${import.meta.env.BASE_URL}logo.png`
                }
                alt="CoPaw"
                className={styles.logoImg}
              />
              {version && (
                <Badge dot={!!hasUpdate} color="red" offset={[4, 18]}>
                  <span
                    className={`${styles.versionBadge} ${
                      hasUpdate
                        ? styles.versionBadgeClickable
                        : styles.versionBadgeDefault
                    }`}
                    onClick={() => hasUpdate && handleOpenUpdateModal()}
                  >
                    v{version}
                  </span>
                </Badge>
              )}
            </div>
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          openKeys={openKeys}
          onOpenChange={(keys) => setOpenKeys(keys as string[])}
          onClick={({ key }) => {
            const path = KEY_TO_PATH[String(key)];
            if (path) navigate(path);
          }}
          items={menuItems}
          theme={isDark ? "dark" : "light"}
        />

        {authEnabled && (
          <div className={styles.authActions}>
            <Button
              type="text"
              icon={<UserCog size={15} />}
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
              icon={<LogOut size={15} />}
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

        <Modal
          open={updateModalOpen}
          onCancel={() => setUpdateModalOpen(false)}
          title={
            <h3 className={styles.updateModalTitle}>
              {t("sidebar.updateModal.title", { version: latestVersion })}
            </h3>
          }
          width={680}
          footer={[
            <Button
              key="releases"
              type="primary"
              onClick={() =>
                window.open(getReleaseNotesUrl(i18n.language), "_blank")
              }
              className={styles.updateModalPrimaryBtn}
            >
              {t("sidebar.updateModal.viewReleases")}
            </Button>,
            <Button key="close" onClick={() => setUpdateModalOpen(false)}>
              {t("sidebar.updateModal.close")}
            </Button>,
          ]}
        >
          <div className={styles.updateModalBody}>
            {!updateMarkdown ? (
              <div className={styles.updateModalSpinWrapper}>
                <Spin />
              </div>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const isBlock =
                      className?.startsWith("language-") ||
                      String(children).includes("\n");
                    if (isBlock) {
                      return (
                        <pre className={styles.codeBlock}>
                          <CopyButton text={String(children)} />
                          <code className={styles.codeBlockInner} {...props}>
                            {children}
                          </code>
                        </pre>
                      );
                    }
                    return (
                      <code className={styles.codeInline} {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {updateMarkdown}
              </ReactMarkdown>
            )}
          </div>
        </Modal>
      </Sider>
    </>
  );
}
