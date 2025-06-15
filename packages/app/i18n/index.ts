// i18n/index.ts
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { Language } from "app/i18n/types";

import aiLocale from "ai/ai.locale";
import chatLocale from "chat/chat.locale";
import spaceLocale from "create/space/space.locale";

import interfaceLocale from "./translations/interface.locale";
import errorLocale from "./translations/error.locale";

export const resources = {
  [Language.EN]: {
    common: {
      ...errorLocale[Language.EN].translation,
      ...interfaceLocale[Language.EN].translation,
    },
    space: spaceLocale[Language.EN].translation,
    ai: aiLocale[Language.EN].translation,
    chat: chatLocale[Language.EN].translation,
  },
  [Language.ZH_CN]: {
    common: {
      ...errorLocale[Language.ZH_CN].translation,
      ...interfaceLocale[Language.ZH_CN].translation,
    },
    space: spaceLocale[Language.ZH_CN].translation,
    ai: aiLocale[Language.ZH_CN].translation,
    chat: chatLocale[Language.ZH_CN].translation,
  },
  [Language.ZH_HANT]: {
    common: {
      ...errorLocale[Language.ZH_HANT].translation,
      ...interfaceLocale[Language.ZH_HANT].translation,
    },
    space: spaceLocale[Language.ZH_HANT].translation,
    ai: aiLocale[Language.ZH_HANT].translation,
    chat: chatLocale[Language.ZH_HANT].translation,
  },
  [Language.JA]: {
    common: {
      ...errorLocale[Language.JA].translation,
      ...interfaceLocale[Language.JA].translation,
    },
    space: spaceLocale[Language.JA].translation,
    ai: aiLocale[Language.JA].translation,
    chat: chatLocale[Language.JA].translation,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: Language.EN,
  defaultNS: "common",
  ns: ["common", "space", "ai", "chat"], // 明确命名空间
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
});

export default i18n;
