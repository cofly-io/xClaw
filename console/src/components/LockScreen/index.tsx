import { useState } from "react";
import { Input, Button, Modal, Form } from "antd";
import {
  LockOutlined,
  UnlockOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import styles from "./index.module.less";

const LOCK_PWD_KEY = "xclaw_lock_pwd";

// SHA-256 hash via Web Crypto API — plaintext never stored
async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(text),
  );
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface LockScreenProps {
  onUnlock: () => void;
}

export default function LockScreen({ onUnlock }: LockScreenProps) {
  const [pwd, setPwd] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [changePwdOpen, setChangePwdOpen] = useState(false);
  const [form] = Form.useForm();

  const getStoredHash = () => localStorage.getItem(LOCK_PWD_KEY) ?? "";

  const handleUnlock = async () => {
    const storedHash = getStoredHash();
    if (storedHash === "") {
      onUnlock();
      setPwd("");
      return;
    }
    if (!pwd) {
      setErrorMsg("请输入临时密码");
      return;
    }
    const hash = await sha256(pwd);
    if (hash === storedHash) {
      onUnlock();
      setPwd("");
      setErrorMsg("");
    } else {
      setErrorMsg("密码错误，请重试");
      setPwd("");
    }
  };

  const handleChangePwd = async (values: {
    oldPwd: string;
    newPwd: string;
  }) => {
    const storedHash = getStoredHash();
    if (storedHash !== "") {
      const oldHash = await sha256(values.oldPwd);
      if (oldHash !== storedHash) {
        form.setFields([{ name: "oldPwd", errors: ["原密码错误"] }]);
        return;
      }
    }
    const newHash = await sha256(values.newPwd);
    localStorage.setItem(LOCK_PWD_KEY, newHash);
    setChangePwdOpen(false);
    form.resetFields();
    setErrorMsg("密码已设置，请用新密码解锁");
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.icon}>
          <LockOutlined />
        </div>
        <div className={styles.title}>主人，早点回来哦！</div>
        <div className={styles.sub}>
          {getStoredHash() === ""
            ? "当前未设置临时密码，直接点解锁"
            : "输入临时密码解锁"}
        </div>

        <Input.Password
          value={pwd}
          onChange={(e) => {
            setPwd(e.target.value);
            setErrorMsg("");
          }}
          onPressEnter={handleUnlock}
          placeholder="临时密码"
          size="large"
          className={styles.input}
          autoComplete="off"
          prefix={<LockOutlined style={{ color: "#7a9cc8" }} />}
        />
        {errorMsg && (
          <div
            style={{
              color: "#ff6b6b",
              fontSize: 12,
              marginTop: -8,
              alignSelf: "flex-start",
            }}
          >
            {errorMsg}
          </div>
        )}

        <Button
          type="primary"
          size="large"
          block
          icon={<UnlockOutlined />}
          onClick={handleUnlock}
          className={styles.unlockBtn}
        >
          解锁
        </Button>

        <Button
          type="text"
          size="small"
          icon={<SettingOutlined />}
          onClick={() => {
            form.resetFields();
            setChangePwdOpen(true);
          }}
          className={styles.setPwdBtn}
        >
          {getStoredHash() === "" ? "设置临时密码" : "修改临时密码"}
        </Button>
      </div>

      <Modal
        open={changePwdOpen}
        onCancel={() => setChangePwdOpen(false)}
        zIndex={10000}
        title={
          <span>
            <SettingOutlined style={{ marginRight: 8, color: "#1864ff" }} />
            {getStoredHash() === "" ? "设置临时密码" : "修改临时密码"}
          </span>
        }
        footer={null}
        width={400}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleChangePwd}
          style={{ marginTop: 16 }}
        >
          {getStoredHash() !== "" && (
            <Form.Item
              name="oldPwd"
              label="原密码"
              rules={[{ required: true, message: "请输入原密码" }]}
            >
              <Input.Password placeholder="原临时密码" autoComplete="off" />
            </Form.Item>
          )}
          {getStoredHash() === "" && (
            <Form.Item name="oldPwd" initialValue="" noStyle>
              <Input type="hidden" />
            </Form.Item>
          )}
          <Form.Item
            name="newPwd"
            label="新密码"
            rules={[{ required: true, message: "请输入新密码" }]}
          >
            <Input.Password placeholder="新临时密码（内容不限）" />
          </Form.Item>
          <Form.Item
            name="confirmPwd"
            label="确认新密码"
            rules={[
              { required: true, message: "请确认新密码" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPwd") === value)
                    return Promise.resolve();
                  return Promise.reject(new Error("两次密码不一致"));
                },
              }),
            ]}
          >
            <Input.Password placeholder="再次输入新密码" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Button
              style={{ marginRight: 8 }}
              onClick={() => setChangePwdOpen(false)}
            >
              取消
            </Button>
            <Button type="primary" htmlType="submit">
              保存
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
