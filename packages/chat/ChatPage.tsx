import i18n from "i18n";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector, useQueryData } from "app/hooks";
import { motion, AnimatePresence } from "framer-motion";
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
import styled from "styled-components";

const PageContainer = styled.div`
  height: 100vh;
  display: flex;
  overflow: hidden;
  background-color: ${(props) => props.theme.surface1};
`;

const SidebarContainer = styled(motion.div)`
  overflow: hidden;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const LoginPrompt = styled.div`
  margin-top: 4rem;
  text-align: center;
  font-size: 1.5rem;
  color: ${(props) => props.theme.text1};
`;

const ChatPage = () => {
  const auth = useAuth();
  const [searchParams] = useSearchParams();
  const dialogId = searchParams.get("dialogId");
  const dispatch = useAppDispatch();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    dialogId && dispatch(initDialog({ dialogId }));
  }, [dialogId]);

  const currentUserId = useAppSelector(selectCurrentUserId);
  const queryConfig = {
    queryUserId: currentUserId,
    options: {
      isJSON: true,
      limit: 100,
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

  if (!auth.user) {
    return <LoginPrompt>{i18n.t("pleaseLogin")}</LoginPrompt>;
  }

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <PageContainer>
      <SidebarContainer
        initial={{ width: 300 }}
        animate={{ width: isSidebarOpen ? 300 : 0 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
      >
        {dialogList.length > 0 && <DialogSidebar dialogList={dialogList} />}
      </SidebarContainer>

      <MainContent>
        {currentDialogConfig && isSuccess && (
          <ChatWindow
            currentDialogConfig={currentDialogConfig}
            toggleSidebar={toggleSidebar}
            isSidebarOpen={isSidebarOpen}
          />
        )}

        {isSuccess && dialogList.length == 0 && <ChatGuide />}
      </MainContent>
    </PageContainer>
  );
};

export default withTranslations(ChatPage, ["chat", "ai"]);
