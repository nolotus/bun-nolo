import React, { useContext } from "react";
import { use } from "i18next";
import { initReactI18next } from "react-i18next";

import { useRoutes } from "react-router-dom";
import { resources } from "i18n";
import Login from "user/pages/Login";
import Default from "web/layout/Default";
import Full from "web/layout/Full";
import Signup from "user/pages/Signup";

import Home from "./pages/Home";
import Page from "./Page";
import Life from "life/All";
import { UserContext } from "user/UserContext";
import {
  UserProfile,
  ExtendedProfile,
  SettingLayout,
  Network,
  Sync,
  PluginSettings,
  ImportSettings,
  ExportSettings,
  AccountSettings,
  ServiceProviderSettings,
} from "setting";
import ChatPage from "chat/ChatPage";

// // import { generatorRoutes } from "./generatorRoutes";

const routes = (currentUser) => [
  {
    path: "/",
    element: <Full />,
    children: [
      {
        path: "settings",
        element: <SettingLayout />,
        children: [
          { path: "user-profile", element: <UserProfile /> },
          { path: "extended-profile", element: <ExtendedProfile /> },
          { path: "plugins", element: <PluginSettings /> },
          { path: "network", element: <Network /> },
          { path: "sync", element: <Sync /> },
          { path: "import", element: <ImportSettings /> },
          { path: "export", element: <ExportSettings /> },
          { path: "account", element: <AccountSettings /> },
          { path: "service-provider", element: <ServiceProviderSettings /> },
        ],
      },
      {
        path: "chat",
        element: <ChatPage />,
      },
    ],
  },
  {
    path: "/*",
    element: <Default />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "signup", element: <Signup /> },
      {
        path: "life",
        element: <Life />,
      },
    ],
  },
  {
    path: "/*",
    element: <Full />,
    children: [{ index: true, element: <Page /> }],
  },
];
export default function App({ hostname, lng = "en" }) {
  // const routes = useMemo(() => generatorRoutes(hostname), [hostname]);
  // let element = useRoutes(routes);
  const { currentUser } = useContext(UserContext);
  console.log("currentUser", currentUser);
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
  const element = useRoutes(routes(currentUser));
  return element;
}
