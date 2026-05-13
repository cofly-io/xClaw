import type { TFunction } from "i18next";

const defaultConfig = {
  theme: {
    colorPrimary: "#1864ff",
    darkMode: false,
    prefix: "xclaw",
    leftHeader: {
      logo: "",
      title: "",
    },
  },
  sender: {
    attachments: true,
    maxLength: 10000,
    disclaimer: "Works for you, grows with you",
  },
  welcome: {
    greeting: "Hello, how can I help you today?",
    description:
      "I am a helpful assistant that can help you with your questions.",
    avatar: `${import.meta.env.BASE_URL}xclaw-symbol.svg`,
    prompts: [
      {
        value: "Let's start a new journey!",
      },
      {
        value: "Can you tell me what skills you have?",
      },
    ],
  },
  api: {
    baseURL: "",
    token: "",
  },
} as const;

export function getDefaultConfig(t: TFunction) {
  return {
    ...defaultConfig,
    sender: {
      ...defaultConfig.sender,
      disclaimer: t("chat.disclaimer"),
    },
    welcome: {
      ...defaultConfig.welcome,
      greeting: t("chat.greeting"),
      description: t("chat.description"),
      prompts: [
        { value: t("chat.prompt1") },
        { value: t("chat.prompt2") },
        { value: t("chat.prompt3") },
      ],
    },
  };
}

export default defaultConfig;

export type DefaultConfig = typeof defaultConfig;
