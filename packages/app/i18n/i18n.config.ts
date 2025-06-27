// app/i18n/i18n.config.ts (新建文件)

import { Language } from "app/i18n/types";
import aiLocale from "ai/ai.locale";
import chatLocale from "chat/chat.locale";
import spaceLocale from "create/space/space.locale";
import interfaceLocale from "./translations/interface.locale";
import errorLocale from "./translations/error.locale";

// 1. 定义共享的翻译资源
export const resources = {
  [Language.EN]: {
    common: {
      ...errorLocale[Language.EN].translation,
      ...interfaceLocale[Language.EN].translation,
      // 新增 SEO 翻译
      seo: {
        title: "Nolo.Chat | Build Your Custom AI Agent Through Conversation",
        description:
          "Create powerful, custom AI Agents on Nolo.Chat with simple conversations. Supports file uploads, image recognition, and code generation to unleash your creativity.",
      },
    },
    space: spaceLocale[Language.EN].translation,
    ai: aiLocale[Language.EN].translation,
    chat: chatLocale[Language.EN].translation,
  },
  [Language.ZH_CN]: {
    common: {
      ...errorLocale[Language.ZH_CN].translation,
      ...interfaceLocale[Language.ZH_CN].translation,
      // 新增 SEO 翻译
      seo: {
        title: "Nolo.Chat | 通过对话构建你的专属AI Agent",
        description:
          "在 Nolo.Chat 上通过简单的对话即可创建功能强大的自定义AI Agent。支持文件上传、图片识别和代码生成，释放您的创造力。",
      },
    },
    space: spaceLocale[Language.ZH_CN].translation,
    ai: aiLocale[Language.ZH_CN].translation,
    chat: chatLocale[Language.ZH_CN].translation,
  },
  // ... 其他语言 (ZH_HANT, JA) 也应添加 seo 字段
  [Language.ZH_HANT]: {
    common: {
      ...errorLocale[Language.ZH_HANT].translation,
      ...interfaceLocale[Language.ZH_HANT].translation,
      seo: {
        title: "Nolo.Chat | 透過對話建立您的專屬AI Agent",
        description:
          "在 Nolo.Chat 上透過簡單的對話即可建立功能強大的自訂AI Agent。支援檔案上傳、圖片辨識和程式碼生成，釋放您的創造力。",
      },
    },
    space: spaceLocale[Language.ZH_HANT].translation,
    ai: aiLocale[Language.ZH_HANT].translation,
    chat: chatLocale[Language.ZH_HANT].translation,
  },
  [Language.JA]: {
    common: {
      ...errorLocale[Language.JA].translation,
      ...interfaceLocale[Language.JA].translation,
      seo: {
        title: "Nolo.Chat | 対話を通じてカスタムAIエージェントを構築",
        description:
          "Nolo.Chatで簡単な対話を通じて、強力なカスタムAIエージェントを作成します。ファイルアップロード、画像認識、コード生成をサポートし、あなたの創造性を解き放ちます。",
      },
    },
    space: spaceLocale[Language.JA].translation,
    ai: aiLocale[Language.JA].translation,
    chat: chatLocale[Language.JA].translation,
  },
};

// 2. 定义共享的配置
export const i18nConfig = {
  resources,
  defaultNS: "common",
  ns: ["common", "space", "ai", "chat"],
  interpolation: {
    escapeValue: false,
  },
  fallbackLng: {
    zh: [Language.ZH_CN, Language.EN],
    "zh-TW": [Language.ZH_HANT],
    "zh-HK": [Language.ZH_HANT],
    "zh-MO": [Language.ZH_HANT],
    default: [Language.EN],
  },
};
