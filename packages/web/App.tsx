import React, { useMemo } from "react";
import { use } from "i18next";
import { initReactI18next } from "react-i18next";

import { useRoutes } from "react-router-dom";
import { UserProvider } from "user";
import { resources } from "i18n";

import { generatorRoutes } from "./generatorRoutes";

export default function App({ preloadState, hostname, lng = "en" }) {
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
  return (
    <html>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.NOLO_STORE_DATA=${JSON.stringify(preloadState)}`,
          }}
        ></script>
        <meta charSet="utf-8" />
        <link rel="stylesheet" href="/public/output.css"></link>
        <title>Bun, Elysia & React</title>
        <meta name="description" content="Bun, Elysia & React" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        <UserProvider>{element}</UserProvider>
      </body>
    </html>
  );
}
