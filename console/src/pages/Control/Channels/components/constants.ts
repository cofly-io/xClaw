import type { TFunction } from "i18next";

// Channel key type - now accepts any string for custom channels
export type ChannelKey = string;

// Built-in channel labels
export const CHANNEL_LABELS: Record<string, string> = {
  imessage: "iMessage",
  discord: "Discord",
  dingtalk: "DingTalk",
  feishu: "Feishu",
  qq: "QQ",
  telegram: "Telegram",
  mqtt: "MQTT",
  mattermost: "Mattermost",
  matrix: "Matrix",
  console: "Console",
  voice: "Twilio",
  sip: "SIP",
  wecom: "WeCom",
  xiaoyi: "XiaoYi",
  weixin: "WeChat",
};

export const CHANNEL_DESCRIPTIONS: Record<string, string> = {
  console: "本地控制台会话，适合开发与调试。",
  dingtalk: "钉钉企业消息通道，适用于组织内部协作。",
  feishu: "飞书机器人通道，适用于团队沟通与自动化。",
  wecom: "企业微信客服/群聊通道，适配企业内网场景。",
  weixin: "微信生态接入通道，面向个人与服务号场景。",
  qq: "QQ 消息通道，适用于国内用户触达。",
  xiaoyi: "小艺语音助手通道，适合终端语音交互。",
};

function formatCustomChannelKey(key: string): string {
  return key
    .split(/[_-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Per-locale strings under `channels.channelNames.*`; missing keys use `defaultValue` (English labels).
export function getChannelLabel(key: string, t?: TFunction): string {
  const english = CHANNEL_LABELS[key] ?? formatCustomChannelKey(key);
  if (t) {
    return t(`channels.channelNames.${key}`, { defaultValue: english });
  }
  return english;
}

export function getChannelDescription(key: string, t?: TFunction): string {
  const fallback = CHANNEL_DESCRIPTIONS[key] ?? "用于消息收发与任务触达。";
  if (t) {
    return t(`channels.channelDescriptions.${key}`, { defaultValue: fallback });
  }
  return fallback;
}
