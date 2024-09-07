import i18n from "i18n";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector, useQueryData } from "app/hooks";
import { motion } from "framer-motion";
import { DataType } from "create/types";
import { selectFilteredDataByUserAndType } from "database/selectors";
import { useAuth } from "auth/useAuth";
import { selectCurrentUserId } from "auth/authSlice";
import { PageLoader } from "render/blocks/PageLoader";
import DialogSidebar from "./dialog/DialogSideBar";
import { initDialog, selectCurrentDialogConfig } from "./dialog/dialogSlice";
import ChatWindow from "./messages/MsgWindow";
import { ChatGuide } from "./ChatGuide";
import withTranslations from "i18n/withTranslations";

const ChatPage = () => {
  const auth = useAuth();
  const [searchParams] = useSearchParams();
  const dialogId = searchParams.get("dialogId");
  const dispatch = useAppDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!auth.user) {
      window.location.href = "/login";
      return;
    }

    dialogId && dispatch(initDialog({ dialogId }));
  }, [auth.user, dialogId, dispatch]);

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
  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);
  const dialogList = useAppSelector(
    selectFilteredDataByUserAndType(currentUserId, DataType.Dialog),
  );

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (isLoading) {
    return <PageLoader />;
  }

  if (!auth.user) {
    return null; // 返回 null，因为我们即将重定向
  }

  const pageContainerStyle = {
    height: "100vh",
    display: "flex",
    overflow: "hidden",
    backgroundColor: "var(--surface1)", // 假设你使用CSS变量来定义主题颜色
  };

  const sidebarContainerStyle = {
    overflow: "hidden",
  };

  const mainContentStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };

  return (
    <div style={pageContainerStyle}>
      <motion.div
        style={sidebarContainerStyle}
        initial={{ width: 300 }}
        animate={{ width: isSidebarOpen ? 300 : 0 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
      >
        {dialogList.length > 0 && <DialogSidebar dialogList={dialogList} />}
      </motion.div>

      <div style={mainContentStyle}>
        {currentDialogConfig && isSuccess && (
          <ChatWindow
            currentDialogConfig={currentDialogConfig}
            toggleSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
          />
        )}

        {isSuccess && dialogList.length === 0 && <ChatGuide />}
      </div>
    </div>
  );
};

export default withTranslations(ChatPage, ["chat", "ai"]);
