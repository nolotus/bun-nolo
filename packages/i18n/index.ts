import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { Language } from "./types";

import errorLocale from "./translations/error.locale";
import aiLocale from "./translations/ai.locale";
import chatLocale from "./translations/chat.locale";
import interfaceLocale from "./translations/interface.locale";

// 合并通用翻译(错误和界面)
const mergeCommonLocales = (errorLocale: any, interfaceLocale: any) => {
  return {
    [Language.EN]: {
      translation: {
        ...errorLocale[Language.EN].translation,
        ...interfaceLocale[Language.EN].translation
      }
    },
    [Language.ZH_CN]: {
      translation: {
        ...errorLocale[Language.ZH_CN].translation,
        ...interfaceLocale[Language.ZH_CN].translation
      }
    },
    [Language.ZH_HANT]: {
      translation: {
        ...errorLocale[Language.ZH_HANT].translation,
        ...interfaceLocale[Language.ZH_HANT].translation
      }
    },
    [Language.JA]: {
      translation: {
        ...errorLocale[Language.JA].translation,
        ...interfaceLocale[Language.JA].translation
      }
    }
  };
};

const commonLocales = mergeCommonLocales(errorLocale, interfaceLocale);

export const resources = {
  [Language.EN]: {
    common: commonLocales[Language.EN].translation,
    ai: aiLocale[Language.EN].translation,
    chat: chatLocale[Language.EN].translation
  },
  [Language.ZH_CN]: {
    common: commonLocales[Language.ZH_CN].translation,
    ai: aiLocale[Language.ZH_CN].translation,
    chat: chatLocale[Language.ZH_CN].translation
  },
  [Language.ZH_HANT]: {
    common: commonLocales[Language.ZH_HANT].translation,
    ai: aiLocale[Language.ZH_HANT].translation,
    chat: chatLocale[Language.ZH_HANT].translation
  },
  [Language.JA]: {
    common: commonLocales[Language.JA].translation,
    ai: aiLocale[Language.JA].translation,
    chat: chatLocale[Language.JA].translation
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: Language.EN,
    defaultNS: "common",
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
