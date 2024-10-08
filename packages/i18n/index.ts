import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import errorMessagesSrc from "./translations/errorMessages";
import { Language } from "./types";
import uiMessagesSrc from "./translations/uiMessages";

const mergeMessages = (errorMessages, uiMessages) => {
  const resources = {};

  for (const key of Object.keys(errorMessages)) {
    resources[key] = {
      ...resources[key],
      translation: {
        ...errorMessages[key]?.translation,
        ...uiMessages[key]?.translation,
      },
    };
  }
  return resources;
};

const mergedResources = mergeMessages(errorMessagesSrc, uiMessagesSrc);

export const resources = {
  [Language.EN]: mergedResources.en,
  [Language.ZH_CN]: mergedResources.zhCN,
  [Language.ZH_HANT]: mergedResources.zhHant,
  [Language.JA]: mergedResources.ja,
};

// eslint-disable-next-line import/no-named-as-default-member
i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: "en", // language to use, more information here: https://www.i18next.com/overview/configuration-options#languages-namespaces-resources
    // you can use the i18n.changeLanguage function to change the language manually: https://www.i18next.com/overview/api#changelanguage
    // if you're using a language detector, do not define the lng option

    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    fallbackLng: {
      zh: [Language.ZH_CN, "en"],
      "zh-TW": ["zh-Hant"],
      "zh-HK": ["zh-Hant"],
      "zh-MO": ["zh-Hant"],
      default: ["en"],
    },
  });

export default i18n;
