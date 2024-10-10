import React, { Suspense, lazy } from "react";
import { PageLoader } from "render/blocks/PageLoader";
import { Outlet } from "react-router-dom";
import Sidebar from "render/layout/Sidebar";

import withTranslations from "i18n/withTranslations";
import ChatSidebarContent from "./ChatSidebarContent";
const ChatPage = lazy(() => import("./ChatPage"));
const ChatGuide = lazy(() => import("./ChatGuide"));

const Layout = () => {
  return (
    <Sidebar sidebarContent={<ChatSidebarContent />} fullWidth>
      <Outlet />
    </Sidebar>
  );
};

const WithI18n = withTranslations(Layout, ["chat", "ai"]);

export const routes = {
  path: "/chat",
  element: <WithI18n />,
  children: [
    {
      index: true,
      element: (
        <Suspense fallback={<PageLoader />}>
          <ChatGuide />
        </Suspense>
      ),
    },
    {
      path: "/chat/:dialogId",
      element: (
        <Suspense fallback={<PageLoader />}>
          <ChatPage />
        </Suspense>
      ),
    },
  ],
};
