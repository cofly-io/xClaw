import { useState, useEffect } from "react";
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
    MessageOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
} from "@ant-design/icons";
import styles from "./index.module.less";

// 覆盖浏览器自动填充白色背景（仅限登录卡片内）
const autofillStyle = `
  #login-card-form input:-webkit-autofill,
  #login-card-form input:-webkit-autofill:hover,
  #login-card-form input:-webkit-autofill:focus,
  #login-card-form input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 1000px rgba(0, 15, 30, 0.95) inset !important;
    -webkit-text-fill-color: #fff !important;
    caret-color: #fff !important;
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

    const getTimeGreeting = () => {
        const h = new Date().getHours();
        if (h >= 5 && h < 10) return { sub: "晨光熹微，愿你今天有个好开始。" };
        if (h >= 11 && h < 12) return { sub: "你不在的时候，我可以给你干活。" };
        if (h >= 12 && h < 17) return { sub: "忙碌了一下午，记得喝杯水。" };
        if (h >= 17 && h < 20) return { sub: "辛苦了一天，来这里放松片刻吧。" };
        if (h >= 20 && h < 22) return { sub: "每一次登录，都是新的故事开始。" };
        if (h >= 22 || h < 5) return { sub: "夜深了，早点休息，我们明天见。" };
        return { sub: "欢迎回来，请登录您的账户。" };
    };
    const greeting = getTimeGreeting();
    const navigate = useNavigate();

    useEffect(() => {
        fetch("/api/supos/config")
            .then((r) => r.json())
            .then((data) => {
                if (data.supos_url) {
                    setSuposUrl(data.supos_url);
                    settingsForm.setFieldValue("supos_url", data.supos_url);
                }
            })
            .catch(() => { });
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
                // 从后端缓存的 token 文件读取（后端已写入），前端标记登录态
                // 同时尝试从响应里取 token 存 localStorage（供其他接口用）
                const inner = result.data?.data;
                const token = (typeof inner === "object" && inner?.accessToken) ? inner.accessToken : "logged_in";
                localStorage.setItem("supos_token", token);
                localStorage.setItem("supos_user", JSON.stringify({ username: values.username }));
                message.success("登录成功");
                onLoginSuccess?.();
                navigate("/chat");
            } else if (resp.status === 502) {
                message.error("无法连接到 supOS 平台，请检查平台地址是否正确");
            } else if (resp.status === 504) {
                message.error("连接 supOS 平台超时，请检查网络或平台地址");
            } else {
                const errMsg = result.message || result.detail || "";
                // 二次确认：踢出旧会话
                if (errMsg.startsWith("__FORCE_LOGIN__:")) {
                    const kickMsg = errMsg.replace("__FORCE_LOGIN__:", "");
                    Modal.confirm({
                        title: "登录确认",
                        content: kickMsg,
                        okText: "确认登录",
                        cancelText: "取消",
                        onOk: () => doLogin(values, true),
                    });
                } else if (errMsg.includes("password") || errMsg.includes("密码") || errMsg.includes("错误") || errMsg.includes("incorrect")) {
                    message.error("密码错误，请重新输入");
                } else if (errMsg.includes("user") || errMsg.includes("账号") || errMsg.includes("不存在")) {
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

    return (
        <div className={styles.loginContainer}>
            <style>{autofillStyle}</style>
            <div className={styles.inner}>
                {/* 顶部栏 */}
                <div className={styles.topBar}>
                    <div
                        className={styles.productName}
                        onClick={() => suposUrl && window.open(suposUrl, "_blank")}
                        style={suposUrl ? { cursor: "pointer" } : undefined}
                    >
                        <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5828" width="18" height="18"><path d="M830.21 485.85c4.39 0.41 9.3-2.81 13.7-4.93 4.93-2.38 9.47-7.54 14.34-7.76 20.39-0.89 40.85-0.37 62.08-0.37v-39.77c-13.28 0-25.79 1.37-37.86-0.36-14.14-2.02-32.82 9.7-41.51-12.19-0.55-1.39-6.05-0.92-9.27-1.14-5.23-0.37-10.47-0.6-17.4-0.98 0-13.58 0.31-25.91-0.11-38.22-0.28-8.46 3.25-11.51 11.49-11.46 5.71 0.04 11.61-0.94 17.1-2.56 7-2.06 13.57-7.13 20.52-7.53 18.77-1.08 37.64-0.37 56.86-0.37v-39.37c-11.35 0-21.78 1.36-31.71-0.31-16.21-2.73-36.95 10.61-48.02-12.67-0.7-1.47-6.09-0.74-9.3-0.96-5.19-0.36-10.38-0.66-16.79-1.07-0.06-27.59 2.58-54.51-18.95-75.6-21.26-20.83-48.83-15.94-71.61-17.72-3.44-11.84-5.53-20.75-8.7-29.25-1.92-5.16-7.32-9.47-7.97-14.57-1.3-10.12-0.4-20.52-0.4-30.8 0-35.87 0-35.88-36.07-31.24-0.46 0.06-0.85 0.65-3.19 2.54 0 15.56 0.47 32.74-0.18 49.88-0.36 9.56 5.37 22.35-10.89 25.88-1.39 0.3-2.16 5.69-2.36 8.78-0.37 5.77-0.11 11.57-0.11 18.18h-49.59c-1.55-9.97-0.76-25.17-4.68-26.5-14.31-4.85-9.71-14.99-10.09-23.66-0.56-12.96-1.39-26.12 0.15-38.92 2.16-17.95-8.36-17.02-20.66-17.33-13.2-0.33-19.47 1.24-20.66 17.79-1.55 21.51 12.89 46.84-11.52 64.59-1.42 1.04-0.63 5.16-0.82 7.85-0.37 5.21-0.7 10.42-1.08 15.98h-47.59c-2.69-10.53-2.37-24.46-7.86-27.34-8.84-4.63-8.37-9.84-8.41-16.54-0.14-20.29-0.05-40.57-0.05-62.06-9.84 0-16.84 0.57-23.72-0.13-11.79-1.2-16.86 2.82-15.99 15.34 0.94 13.46 0.31 27.05 0.16 40.57-0.06 5.92 0.78 16.45-1.17 17.04-18.15 5.52-10 21.08-13.53 33.5h-46.96c-2.32-10.09-1.81-24.66-7.04-27.14-10.5-4.98-9.38-11.54-9.42-19.32-0.08-19.31-0.03-38.62-0.03-57.45-37.49-7.4-37.98-6.06-39.63 28.31-0.84 17.38 10.45 38.77-12.35 51.52-1.56 0.87-0.66 6.14-0.9 9.36-0.35 4.7-0.71 9.4-1.16 15.42-26.68 0.62-53.29-2.54-74.24 17.96-21.49 21.02-17.8 48.36-18.74 73.43-9.74 2.45-22.85 2.41-24.59 6.85-4.33 10.99-11.55 9.67-19.37 9.73-19.36 0.14-38.72 0.05-58.72 0.05v39.38c20.28 0 40.17-0.23 60.06 0.16 5.09 0.1 14.16 1.38 14.57 3.46 2.6 13.22 12.54 8.61 20.24 10.42 4.16 0.98 10.53 4.92 10.79 7.97 1.17 13.71 0.51 27.57 0.51 40.1-11.6 2.85-20.7 4.5-29.38 7.43-5.67 1.92-10.59 7.96-16.05 8.24-19.82 1.03-39.73 0.41-60.5 0.41v39.93c17.41 0 34.1-0.75 50.66 0.28 9.76 0.61 23.88-7.04 27.32 11.02 0.22 1.13 5.87 1.59 9.02 1.73 5.74 0.27 11.5 0.08 19.04 0.08 0 13.91-0.53 25.72 0.16 37.46 0.61 10.43-2.88 14.76-13.76 14.21-5.2-0.26-14.65 1.74-15.15 4.16-2.17 10.48-9.26 8.9-16.08 8.92-20.35 0.06-40.71 0.02-60.79 0.02v39.52c13.72 0 26.28-1.25 38.48 0.33 13.77 1.79 31.87-9.41 40.31 11.86 0.55 1.4 6.02 0.94 9.22 1.17 5.25 0.38 10.51 0.61 17.61 1.01 0 13.41-0.42 25.73 0.14 38 0.43 9.45-3.74 11.98-12.51 12.19-5.78 0.14-11.7 2.52-17.18 4.81-5.58 2.33-10.58 8.02-16.03 8.31-19.82 1.03-39.73 0.41-60.15 0.41v39.09c19.01 0 36.82-0.23 54.62 0.1 8.97 0.16 20.3-3.93 22.76 11.03 0.25 1.54 6.38 2.57 9.89 3.02 5.66 0.73 11.41 0.78 18.03 1.17 1.01 27.15-2.41 53.61 18.26 74.67 21.26 21.65 48.82 16.44 76.16 18.92 0 7.01-0.59 12.91 0.21 18.61 0.52 3.69 2.9 7.2 4.79 10.59 2.69 4.84 7.94 9.39 8.18 14.27 0.96 19.21 0.39 38.49 0.39 57.96h39.31c0-20.9-0.19-40.8 0.15-60.7 0.08-4.51 1.17-12.45 3.17-12.92 12.45-2.9 9.09-12.24 10.65-20.32 0.84-4.37 5.55-10.97 9.05-11.32 13.26-1.34 26.74-0.54 39.32-0.54 2.36 11.16 1.64 25.76 6.75 28.21 10.74 5.16 8.77 12.21 8.86 19.72 0.25 19.22 0.08 38.45 0.08 58.08h40.17c0-12.01-1.31-23.42 0.31-34.39 2.28-15.39-9.82-34.9 11.84-45.42 1.07-0.52 1.26-4.17 0.88-6.17-3.57-19.1 7.28-21.75 22.39-20.21 5.36 0.55 10.84 0.44 16.22 0.04 10.01-0.74 13.24 3.95 13.18 13.5-0.03 5.4 1.48 14.89 4.01 15.51 11.01 2.69 9.25 10.36 9.28 17.68 0.08 19.76 0.03 39.52 0.03 59.08h39.46c0-9.17-1.4-17.47 0.28-25.1 4-18.2-11.95-41.11 12.57-54.72 1.29-0.72 0.67-5.11 0.72-7.8 0.09-5.32 0.03-10.65 0.03-16.81h47.65c2.8 10.45 2.5 23.85 8.19 27.26 8.8 5.27 8.81 10.79 8.81 18.23 0.01 19.75 0 39.5 0 58.73h39.12c0-21.32-0.34-41.25 0.26-61.16 0.14-4.59 3.3-9.17 5.44-13.58 2.47-5.1 7.89-10.18 7.57-14.97-0.93-13.74 5.25-17.17 17.27-15.9 4.81 0.51 9.73 0.14 14.6 0 36.36-1.04 60.72-24.95 62.32-61.27 0.29-6.48 0.58-13.03 0.02-19.47-0.88-10.09 3.56-13.11 13.19-13.18 5.6-0.04 11.36-2.91 16.72-5.24 5.13-2.23 9.73-7.58 14.74-7.83 19.21-0.94 38.5-0.38 57.89-0.38v-39.53c-21.26 0-41.23 0.18-61.19-0.14-4.59-0.07-12.92-1.37-13.13-2.95-1.8-13.58-12-8.95-19.68-10.86-4.38-1.09-10.82-5.59-11.17-9.07-1.32-13.23-0.53-26.66-0.53-41.75 7.9 0 13.76 0.39 19.53-0.15 3.34-0.32 9.17-1.79 9.38-3.35 1.73-12.78 11.28-9.45 18.74-9.56 19.29-0.29 38.58-0.1 58.28-0.1v-39.75c-21.53 0-42.01 0.34-62.46-0.27-4.51-0.13-9.04-3.39-13.34-5.64-4.02-2.11-7.46-5.89-11.66-6.97-5.44-1.39-11.38-0.83-18.52-1.18 0-12.45 0.71-23.24-0.18-33.91-1-12.39 2.8-18.07 16.16-16.84z m-76.38 240.53c-0.03 25.06-5.65 30.9-30.35 30.91-141.21 0.08-282.42 0.08-423.63 0.01-25.68-0.01-31.39-5.86-31.4-31.73-0.05-141.75-0.05-283.5 0-425.26 0.01-24.74 5.99-30.8 30.55-30.81 141.75-0.06 283.5-0.06 425.26 0.01 23.5 0.01 29.54 6.21 29.56 29.99 0.08 71.42 0.03 142.83 0.03 214.25 0.01 70.87 0.05 141.75-0.02 212.63z" fill="#06df15" p-id="5829"></path><path d="M696.81 310.02c-122.86 0.45-245.72 0.55-368.57-0.09-16.17-0.08-19.87 5.33-19.68 20.46 0.09 7.58 0.17 15.15 0.23 22.73 0.42 53.04 0.08 106.08 0.08 159.12 0 46.68 0.17 93.36 0.02 140.04-0.05 15.56-0.13 31.12-0.27 46.68-0.12 13.05 3.28 17.93 17.16 17.88 124.48-0.46 248.96-0.44 373.45-0.02 13.17 0.04 16.37-4.6 16.33-17.03-0.38-123.94-0.47-247.88 0.09-371.82 0.06-14.86-5.14-18-18.84-17.95zM385.78 419.11c-16.91-0.07-29.55-12.62-29.73-29.52-0.18-16.98 13.69-31.19 30.33-31.09 16.06 0.1 29.93 13.81 30.24 29.9 0.33 16.77-13.74 30.78-30.84 30.71z" fill="#06df15" p-id="5830"></path><path d="M308.87 512.24c0-53.04 0.34-106.09-0.08-159.12 0.41 53.04 0.08 106.08 0.08 159.12 0 46.68 0.17 93.36 0.02 140.04 0.15-46.68-0.02-93.36-0.02-140.04z" fill="#06df15" p-id="5831"></path></svg>
                        <img src="/default_login_logo.png" alt="supOS" className={styles.logoImg} />
                        {suposUrl && (
                            <span className={styles.platformBadge}>
                                {suposUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                            </span>
                        )}
                    </div>
                    <Button
                        type="text"
                        icon={<SettingOutlined />}
                        className={styles.settingsBtn}
                        onClick={() => setSettingsOpen(true)}
                    >
                        设置
                    </Button>
                </div>

                {/* 主内容 */}
                <div className={styles.mainGrid}>
                    {/* 左侧 */}
                    <div className={styles.leftPanel}>
                        <div className={styles.brand}>
                            <h1>xClaw</h1>
                            <div className={styles.brandSub}>
                                <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="8287" width="28" height="28"><path d="M576 85.333333c0 18.944-8.234667 35.968-21.333333 47.701334V213.333333h213.333333a128 128 0 0 1 128 128v426.666667a128 128 0 0 1-128 128H256a128 128 0 0 1-128-128V341.333333a128 128 0 0 1 128-128h213.333333V133.034667A64 64 0 1 1 576 85.333333zM0 426.666667h85.333333v256H0v-256z m1024 0h-85.333333v256h85.333333v-256zM384 618.666667a64 64 0 1 0 0-128 64 64 0 0 0 0 128z m320-64a64 64 0 1 0-128 0 64 64 0 0 0 128 0z" fill="#dcf0ffe6" p-id="8288"></path></svg>
                                {/* <img src="/dolphin.png" alt="dolphin" className={styles.dolphinImg} /> */}
                                xClaw 个人AI企业助手
                            </div>
                        </div>

                        <div className={styles.messageBubble}>
                            <p>
                                <MessageOutlined />
                                Hi！您好，我是您的个人AI企业助手
                            </p>
                        </div>

                        <div className={styles.tagline}>
                            <ThunderboltOutlined />
                            让工作更智能，让协作更高效
                        </div>
                    </div>

                    {/* 右侧登录卡片 */}
                    <div className={styles.loginCard}>
                        <div className={styles.cardHeader}>
                            <div className={styles.brand}>
                                <h4>WELCOME...</h4>
                                <div className={styles.brandSub2}>
                                    <strong>{greeting.sub}</strong>
                                </div>
                            </div>
                        </div>

                        <Form id="login-card-form" form={loginForm} layout="vertical" onFinish={handleLogin}>
                            <Form.Item name="username" style={{ marginBottom: "1.8rem" }} rules={[{ required: true, message: "请输入用户名" }]}>
                                <Input
                                    prefix={<UserOutlined style={{ color: "#727272ff", paddingRight: "8px" }} />}
                                    placeholder="用户名 / 账号"
                                    size="large"
                                    className={styles.inputField}
                                    autoComplete="username"
                                />
                            </Form.Item>

                            <Form.Item name="password" style={{ marginBottom: "1.8rem" }} rules={[{ required: true, message: "请输入密码" }]}>
                                <Input.Password
                                    prefix={<LockOutlined style={{ color: "#727272ff", paddingRight: "8px" }} />}
                                    placeholder="密码"
                                    size="large"
                                    className={styles.inputField}
                                    autoComplete="current-password"
                                    iconRender={(visible) =>
                                        visible
                                            ? <EyeOutlined style={{ color: "#727272ff", cursor: "pointer" }} />
                                            : <EyeInvisibleOutlined style={{ color: "#727272ff", cursor: "pointer" }} />
                                    }
                                />
                            </Form.Item>

                            <Form.Item style={{ marginBottom: 0 }}>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    block
                                    className={styles.loginButton}
                                    icon={<ArrowRightOutlined />}
                                >
                                    登录
                                </Button>
                            </Form.Item>
                        </Form>

                        <div className={styles.cardFooter}>
                            <ArrowRightOutlined style={{ color: "rgba(46, 164, 194, 0.8)" }} />
                            <span>xClaw 个人AI企业助手</span>
                            <ArrowRightOutlined style={{ color: "rgba(46, 164, 194, 0.8)", transform: "rotate(180deg)" }} />
                        </div>
                    </div>
                </div>

                <div className={styles.glowLine} />
            </div>

            {/* 设置弹窗 */}
            <Modal
                open={settingsOpen}
                onCancel={() => setSettingsOpen(false)}
                title={
                    <span className={styles.modalTitle}>
                        <SettingOutlined style={{ marginRight: 8, color: "#1864ff" }} />
                        平台设置
                    </span>
                }
                footer={null}
                width={800}
            >
                <div className={styles.modalDesc}>
                    填写您的 supOS 平台地址，保存后即可使用平台账号登录。
                    <div style={{color:'#8a8a8aff'}}>支持域名和IP地址</div>
                </div>
                <Form form={settingsForm} layout="vertical" onFinish={handleSaveSettings}>
                    <Form.Item
                        name="supos_url"
                        label="supOS 平台地址"
                        rules={[
                            { required: true, message: "请输入平台地址" },
                            { pattern: /^https?:\/\/.+/, message: "地址需以 http:// 或 https:// 开头" },
                        ]}
                    >
                        <Input
                            prefix={<GlobalOutlined />}
                            placeholder="https://your-supos.example.com"
                            size="large"
                        />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
                        <Button style={{ marginRight: 8 }} onClick={() => setSettingsOpen(false)}>
                            取消
                        </Button>
                        <Button type="primary" htmlType="submit" loading={settingsSaving} icon={<SaveOutlined />}>
                            保存
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}
