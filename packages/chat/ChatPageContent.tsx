// chat/ChatPageContent.tsx
import React, { useEffect, useState, useCallback } from "react";
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
import { useWorkspace } from "./contexts/WorkspaceContext";

const ChatPageContent = () => {
  const auth = useAuth();
  const [searchParams] = useSearchParams();
  const dialogId = searchParams.get("dialogId");
  const dispatch = useAppDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { currentWorkspace, setCurrentWorkspace, moveEntityToWorkspace } =
    useWorkspace();

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "b") {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [toggleSidebar]);

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

  if (isLoading) {
    return <PageLoader />;
  }

  if (!auth.user) {
    return null;
  }

  const pageContainerStyle = {
    height: "100vh",
    display: "flex",
    overflow: "hidden",
    backgroundColor: "var(--surface1)",
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
        {dialogList.length > 0 && (
          <DialogSidebar
            dialogList={dialogList}
            currentWorkspace={currentWorkspace}
            setCurrentWorkspace={setCurrentWorkspace}
            moveEntityToWorkspace={moveEntityToWorkspace}
          />
        )}
      </motion.div>

      <div style={mainContentStyle}>
        {currentDialogConfig && isSuccess && (
          <ChatWindow
            currentDialogConfig={currentDialogConfig}
            toggleSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
            currentWorkspace={currentWorkspace}
          />
        )}

        {isSuccess && dialogList.length === 0 && <ChatGuide />}
      </div>
    </div>
  );
};

export default ChatPageContent;
