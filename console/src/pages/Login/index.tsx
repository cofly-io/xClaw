import { useState, useEffect, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Form, Input, message, Modal } from "antd";
import {
  UserOutlined,
  LockOutlined,
  SettingOutlined,
  GlobalOutlined,
  SaveOutlined,
  ArrowRightOutlined,
  ThunderboltOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { Bot, Coffee, MessageSquare, UserRound } from "lucide-react";
import styles from "./index.module.less";

/** 左侧工业场景对话示例（精简展示） */
const INDUSTRIAL_CHAT_PREVIEW: { role: "user" | "assistant"; text: string }[] =
  [
    { role: "user", text: "3 号线注塑机能耗偏高，能对比上周同班次吗？" },
    {
      role: "assistant",
      text: "早班较上周高约 12%，可查 supOS 设备曲线与冷却水路。",
    },
    { role: "user", text: "报警 A-2048 要停线吗？" },
    {
      role: "assistant",
      text: "多为 OPC 短时中断，先看网关与 PLC，短时未恢复再处理。",
    },
  ];

// 覆盖浏览器自动填充背景（仅限登录卡片内）
const autofillStyle = `
  #login-card-form input:-webkit-autofill,
  #login-card-form input:-webkit-autofill:hover,
  #login-card-form input:-webkit-autofill:focus,
  #login-card-form input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 1000px #fafcff inset !important;
    -webkit-text-fill-color: #121f3f !important;
    caret-color: #121f3f !important;
    transition: background-color 9999s ease-in-out 0s !important;
  }
`;

interface LoginForm {
  username: string;
  password: string;
}

interface SettingsForm {
  supos_url: string;
}

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [loginForm] = Form.useForm<LoginForm>();
  const [settingsForm] = Form.useForm<SettingsForm>();
  const [loading, setLoading] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [suposUrl, setSuposUrl] = useState("");
  const [now, setNow] = useState(() => new Date());

  const getTimeGreeting = () => {
    const h = now.getHours();
    if (h >= 5 && h < 10) return { sub: "晨光熹微，愿你今天有个好开始..." };
    if (h >= 11 && h < 12) return { sub: "你不在的时候，我可以给你干活..." };
    if (h >= 12 && h < 17) return { sub: "忙碌了一下午，记得喝杯水..." };
    if (h >= 17 && h < 20) return { sub: "辛苦了一天，来这里放松片刻吧..." };
    if (h >= 20 && h < 22) return { sub: "每一次登录，都是新的故事开始..." };
    if (h >= 22 || h < 5) return { sub: "夜深了，早点休息，我们明天见..." };
    return { sub: "欢迎回来，请登录您的账户。" };
  };
  const greeting = getTimeGreeting();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch("/api/supos/config")
      .then((r) => r.json())
      .then((data) => {
        if (data.supos_url) {
          setSuposUrl(data.supos_url);
          settingsForm.setFieldValue("supos_url", data.supos_url);
        }
      })
      .catch(() => {});
  }, [settingsForm]);

  const handleSaveSettings = async (values: SettingsForm) => {
    setSettingsSaving(true);
    try {
      const resp = await fetch("/api/supos/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supos_url: values.supos_url }),
      });
      const result = await resp.json();
      if (resp.ok && result.success) {
        setSuposUrl(result.supos_url);
        message.success("平台地址已保存");
        setSettingsOpen(false);
      } else {
        message.error(result.detail || "保存失败");
      }
    } catch {
      message.error("保存失败，请检查网络");
    } finally {
      setSettingsSaving(false);
    }
  };

  const doLogin = async (values: LoginForm, forceLogin = false) => {
    setLoading(true);
    try {
      const resp = await fetch("/api/supos/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, force_login: forceLogin }),
      });
      const result = await resp.json();
      if (resp.ok && result.success) {
        const inner = result.data?.data;
        const token =
          typeof inner === "object" && inner?.accessToken
            ? inner.accessToken
            : "logged_in";
        localStorage.setItem("supos_token", token);
        localStorage.setItem(
          "supos_user",
          JSON.stringify({ username: values.username }),
        );
        message.success("登录成功");
        onLoginSuccess?.();
        navigate("/chat");
      } else if (resp.status === 502) {
        message.error("无法连接到 supOS 平台，请检查平台地址是否正确");
      } else if (resp.status === 504) {
        message.error("连接 supOS 平台超时，请检查网络或平台地址");
      } else {
        const errMsg = result.message || result.detail || "";
        if (errMsg.startsWith("__FORCE_LOGIN__:")) {
          const kickMsg = errMsg.replace("__FORCE_LOGIN__:", "");
          Modal.confirm({
            title: "登录确认",
            content: kickMsg,
            okText: "确认登录",
            cancelText: "取消",
            onOk: () => doLogin(values, true),
          });
        } else if (
          errMsg.includes("password") ||
          errMsg.includes("密码") ||
          errMsg.includes("错误") ||
          errMsg.includes("incorrect")
        ) {
          message.error("密码错误，请重新输入");
        } else if (
          errMsg.includes("user") ||
          errMsg.includes("账号") ||
          errMsg.includes("不存在")
        ) {
          message.error("账号不存在，请检查用户名");
        } else {
          message.error(errMsg || "登录失败，请检查用户名和密码");
        }
      }
    } catch (e) {
      if (e instanceof TypeError && String(e).includes("fetch")) {
        message.error("网络异常，无法连接到服务器");
      } else {
        message.error("登录请求失败，请稍后重试");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (values: LoginForm) => {
    if (!suposUrl) {
      message.warning("请先点击「设置」填写 supOS 平台地址");
      setSettingsOpen(true);
      return;
    }
    await doLogin(values);
  };

  const handleForgotPassword = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!suposUrl?.trim()) {
      message.warning("请先配置 supOS 平台地址");
      setSettingsOpen(true);
      return;
    }
    const base = suposUrl.trim().replace(/\/$/, "");
    window.open(`${base}/#/resetPwd`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className={styles.loginContainer}>
      <style>{autofillStyle}</style>
      <div className={styles.topLeftBar}>
        <div
          className={styles.productName}
          onClick={() => suposUrl && window.open(suposUrl, "_blank")}
          style={suposUrl ? { cursor: "pointer" } : undefined}
        >
          <img
            src="/default_login_logo.png"
            alt="supOS"
            className={styles.logoImg}
          />
          <span>xClaw</span>
        </div>
        {suposUrl && (
          <span className={styles.platformBadge}>
            {suposUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </span>
        )}
      </div>
      <div className={styles.layout}>
        <div className={styles.leftPanel}>
          <div className={styles.chatPreview}>
            <div className={styles.chatPreviewHeader}>
              <MessageSquare
                className={styles.chatPreviewHeaderIcon}
                size={18}
                strokeWidth={2}
              />
              <span className={styles.chatPreviewTitle}>
                工业场景 · 对话记录
              </span>
              {/* <span className={styles.chatPreviewBadge}>
                                <Building2 size={12} strokeWidth={2} aria-hidden />
                                示例
                            </span> */}
            </div>
            <div
              className={styles.chatPreviewList}
              aria-label="工业场景对话示例"
            >
              {INDUSTRIAL_CHAT_PREVIEW.map((m, i) =>
                m.role === "user" ? (
                  <div
                    key={i}
                    className={`${styles.chatRow} ${styles.chatRowUser}`}
                  >
                    <div className={styles.chatBubbleUser}>
                      <p className={styles.chatBubbleText}>{m.text}</p>
                    </div>
                    <div className={styles.chatMeta}>
                      <UserRound size={14} strokeWidth={2} aria-hidden />
                      <span>工程师</span>
                    </div>
                  </div>
                ) : (
                  <div
                    key={i}
                    className={`${styles.chatRow} ${styles.chatRowAssistant}`}
                  >
                    <div className={styles.chatMeta}>
                      <Bot size={14} strokeWidth={2} aria-hidden />
                      <span>xClaw</span>
                    </div>
                    <div className={styles.chatBubbleAssistant}>
                      <p className={styles.chatBubbleText}>{m.text}</p>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        <div className={styles.loginCard}>
          <div className={styles.cardHeader}>
            <div className={styles.brand}>
              <span className={styles.brandLeadingIcon}>
                <ThunderboltOutlined />
              </span>
              <div className={styles.brandText}>
                xClaw
                <span className={styles.brandSub}>个人AI企业助手</span>
              </div>
            </div>
            <Button
              type="default"
              icon={<SettingOutlined />}
              className={styles.headerSettingsBtn}
              onClick={() => setSettingsOpen(true)}
            >
              supOS平台配置
            </Button>
          </div>

          <div className={styles.welcomeSection}>
            <div className={styles.welcomeEyebrow}>
              <ClockCircleOutlined style={{ marginRight: 6 }} />
              WELCOME...
            </div>
            <div className={styles.reminderMessage}>
              <span className={styles.reminderIconWrap} aria-hidden>
                <Coffee
                  className={styles.reminderLucideIcon}
                  size={18}
                  strokeWidth={2}
                />
              </span>
              <span className={styles.reminderText}>{greeting.sub}</span>
            </div>
          </div>

          <Form
            id="login-card-form"
            form={loginForm}
            onFinish={handleLogin}
            className={styles.loginForm}
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: "请输入用户名" }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="用户名 / 邮箱"
                className={styles.loginInput}
                autoComplete="username"
              />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: "请输入密码" }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
                className={styles.loginInput}
                autoComplete="current-password"
                iconRender={(visible) =>
                  visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <div className={styles.formOptions}>
              <label className={styles.checkboxLabel}>
                <input type="checkbox" defaultChecked />
                记住登录
              </label>
              <a
                href="#"
                className={styles.forgotLink}
                onClick={handleForgotPassword}
              >
                忘记密码？
              </a>
            </div>

            <Button
              htmlType="submit"
              loading={loading}
              className={styles.loginAction}
              block
            >
              <span>登录 · 进入工作台</span>
              <ArrowRightOutlined />
            </Button>
          </Form>

          <div className={styles.cliPrompt}>
            <span className={styles.promptSign}>&gt;</span>
            <span className={styles.cliText}>xClaw个人AI企业助手</span>
            <span className={styles.cursorBlink} />
            <Button
              type="text"
              icon={<SettingOutlined />}
              className={styles.settingsBtn}
              onClick={() => setSettingsOpen(true)}
            />
          </div>

          <div className={styles.footnote}>企业级加密 · 仅限授权访问</div>
        </div>
      </div>

      {/* 设置弹窗 */}
      <Modal
        open={settingsOpen}
        onCancel={() => setSettingsOpen(false)}
        title={
          <span className={styles.modalTitle}>
            <SettingOutlined style={{ marginRight: 8, color: "#1677ff" }} />
            平台设置
          </span>
        }
        footer={null}
        width={560}
      >
        <div className={styles.modalDesc}>
          填写您的 supOS 平台地址，保存后即可使用平台账号登录。
          <div style={{ color: "#9ca3af" }}>支持域名和IP地址</div>
        </div>
        <Form
          form={settingsForm}
          layout="vertical"
          onFinish={handleSaveSettings}
        >
          <Form.Item
            name="supos_url"
            label="supOS 平台地址"
            rules={[
              { required: true, message: "请输入平台地址" },
              {
                pattern: /^https?:\/\/.+/,
                message: "地址需以 http:// 或 https:// 开头",
              },
            ]}
          >
            <Input
              prefix={<GlobalOutlined />}
              placeholder="https://your-supos.example.com"
              size="large"
            />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Button
              style={{ marginRight: 8 }}
              onClick={() => setSettingsOpen(false)}
            >
              取消
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={settingsSaving}
              icon={<SaveOutlined />}
            >
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
