// src/app/i18n/i18n.config.ts
import { Language } from "app/i18n/types";
import aiLocale from "ai/ai.locale";
import chatLocale from "chat/chat.locale";
import spaceLocale from "create/space/space.locale";
import interfaceLocale from "./translations/interface.locale";
import errorLocale from "./translations/error.locale";
import seoLocale from "./translations/seo.locale";

export const resources = {
  [Language.EN]: {
    common: {
      // 先合并已有的 error + interface 文案
      ...errorLocale[Language.EN].translation,
      ...interfaceLocale[Language.EN].translation,
      // 再挂载一个 seo 子对象
      seo: seoLocale[Language.EN],
    },
    space: spaceLocale[Language.EN].translation,
    ai: aiLocale[Language.EN].translation,
    chat: chatLocale[Language.EN].translation,
  },
  [Language.ZH_CN]: {
    common: {
      ...errorLocale[Language.ZH_CN].translation,
      ...interfaceLocale[Language.ZH_CN].translation,
      seo: seoLocale[Language.ZH_CN],
    },
    space: spaceLocale[Language.ZH_CN].translation,
    ai: aiLocale[Language.ZH_CN].translation,
    chat: chatLocale[Language.ZH_CN].translation,
  },
  [Language.ZH_HANT]: {
    common: {
      ...errorLocale[Language.ZH_HANT].translation,
      ...interfaceLocale[Language.ZH_HANT].translation,
      seo: seoLocale[Language.ZH_HANT],
    },
    space: spaceLocale[Language.ZH_HANT].translation,
    ai: aiLocale[Language.ZH_HANT].translation,
    chat: chatLocale[Language.ZH_HANT].translation,
  },
  [Language.JA]: {
    common: {
      ...errorLocale[Language.JA].translation,
      ...interfaceLocale[Language.JA].translation,
      seo: seoLocale[Language.JA],
    },
    space: spaceLocale[Language.JA].translation,
    ai: aiLocale[Language.JA].translation,
    chat: chatLocale[Language.JA].translation,
  },
};

export const i18nConfig = {
  resources,
  defaultNS: "common",
  ns: ["common", "space", "ai", "chat"],
  interpolation: { escapeValue: false },
  fallbackLng: {
    zh: [Language.ZH_CN, Language.EN],
    "zh-TW": [Language.ZH_HANT],
    "zh-HK": [Language.ZH_HANT],
    "zh-MO": [Language.ZH_HANT],
    default: [Language.EN],
  },
};
