import React, { useMemo } from "react";
import { use } from "i18next";
import { initReactI18next } from "react-i18next";

import { useRoutes } from "react-router-dom";
import { UserProvider } from "user";
import { resources } from "i18n";

import { generatorRoutes } from "./generatorRoutes";

export default function App({ hostname, lng = "en" }) {
  const routes = useMemo(() => generatorRoutes(hostname), [hostname]);
  let element = useRoutes(routes);

  use(initReactI18next).init({
    lng,
    fallbackLng: {
      "zh-TW": ["zh-Hant"],
      "zh-HK": ["zh-Hant"],
      "zh-MO": ["zh-Hant"],
      default: ["en"],
    },
    interpolation: {
      escapeValue: false,
    },
    resources,
  });
  return <UserProvider>{element}</UserProvider>;
}
