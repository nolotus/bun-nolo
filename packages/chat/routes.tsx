import React, { Suspense, lazy } from "react";
import { PageLoader } from "render/blocks/PageLoader";
import { Outlet } from "react-router-dom";
import Sidebar from "render/layout/Sidebar";
import CustomizeAIButton from "ai/cybot/CustomizeAIButton";
import NewDialogButton from "chat/dialog/NewDialogButton";
import withTranslations from "i18n/withTranslations";
import { styles } from "render/ui/styles";
import { useAppSelector, useQueryData } from "app/hooks";
import { DataType } from "create/types";
import { selectCurrentUserId } from "auth/authSlice";

import DialogSideBar from "./dialog/DialogSideBar";
const ChatPage = lazy(() => import("./ChatPage"));
const ChatGuide = lazy(() => import("./ChatGuide"));

const Layout = () => {
  const currentUserId = useAppSelector(selectCurrentUserId);

  const queryConfig = {
    queryUserId: currentUserId,
    options: {
      isJSON: true,
      limit: 200,
      condition: {
        type: DataType.Dialog,
      },
    },
  };
  const { isLoading, isSuccess } = useQueryData(queryConfig);

  const sidebarContent = (
    <nav>
      <div style={{ ...styles.flexBetween, ...styles.gap2 }}>
        <CustomizeAIButton />
        <NewDialogButton />
      </div>
      <DialogSideBar />
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
