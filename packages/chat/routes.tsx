import React, { Suspense, lazy } from "react";
import { PageLoader } from "render/blocks/PageLoader";
import { Outlet } from "react-router-dom";
import Sidebar from "render/layout/Sidebar";
import CustomizeAIButton from "ai/cybot/CustomizeAIButton";
import NewDialogButton from "chat/dialog/NewDialogButton";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";
import withTranslations from "i18n/withTranslations";

const ChatPage = lazy(() => import("./ChatPage"));

const Layout = () => {
  const theme = useSelector(selectTheme);

  const buttonContainerStyle = {
    display: "flex",
    justifyContent: "space-between",
    gap: theme.spacing.medium,
  };

  const sidebarContent = (
    <nav>
      <div style={buttonContainerStyle}>
        <CustomizeAIButton />
        <NewDialogButton />
      </div>
    </nav>
  );

  return (
    <Sidebar sidebarContent={sidebarContent} fullWidth>
      <Outlet />
    </Sidebar>
  );
};
const WithI18n = withTranslations(Layout, ["chat", "ai"]);

export const routes = {
  path: "/",
  element: <WithI18n />,
  children: [
    {
      path: "chat",
      element: (
        <Suspense fallback={<PageLoader />}>
          <ChatPage />
        </Suspense>
      ),
    },
  ],
};
