// src/app/i18n/translations/seo.locale.ts
import { Language } from "app/i18n/types";

const seoLocale: Record<
  Language,
  {
    title: string;
    description: string;
  }
> = {
  [Language.EN]: {
    title: "Nolo.Chat | Build Your Custom AI Agent Through Conversation",
    description:
      "Create powerful, custom AI Agents on Nolo.Chat with simple conversations. Supports file uploads, image recognition, and code generation to unleash your creativity.",
  },
  [Language.ZH_CN]: {
    title: "Nolo.Chat | 通过对话构建你的专属AI Agent",
    description:
      "在 Nolo.Chat 上通过简单的对话即可创建功能强大的自定义AI Agent。支持文件上传、图片识别和代码生成，释放您的创造力。",
  },
  [Language.ZH_HANT]: {
    title: "Nolo.Chat | 透過對話建立您的專屬AI Agent",
    description:
      "在 Nolo.Chat 上透過簡單的對話即可建立功能強大的自訂AI Agent。支援檔案上傳、圖片辨識和程式碼生成，釋放您的創造力。",
  },
  [Language.JA]: {
    title: "Nolo.Chat | 対話を通じてカスタムAIエージェントを構築",
    description:
      "Nolo.Chatで簡単な対話を通じて、強力なカスタムAIエージェントを作成します。ファイルアップロード、画像認識、コード生成をサポートし、あなたの創造性を解き放ちます。",
  },
};

export default seoLocale;
