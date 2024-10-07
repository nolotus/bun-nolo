// chat/ChatPage.tsx
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { useAuth } from "auth/useAuth";
import { styles, themeStyles } from "render/ui/styles";
import { useParams } from "react-router-dom";

import { initDialog, selectCurrentDialogConfig } from "./dialog/dialogSlice";
import ChatWindow from "./messages/MsgWindow";

const ChatPage = () => {
  const auth = useAuth();
  const { dialogId } = useParams();
  const dispatch = useAppDispatch();
  //maybe not need login
  useEffect(() => {
    if (!auth.user) {
      window.location.href = "/login";
      return;
    }

    dialogId && dispatch(initDialog({ dialogId }));
  }, [auth.user, dialogId, dispatch]);

  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);

  if (!auth.user) {
    return null;
  }

  return (
    <div
      style={{
        ...styles.flex,
        ...styles.h100vh,
        ...styles.overflowXHidden,
        ...themeStyles.bgColor1,
      }}
    >
      <div
        style={{
          ...styles.flexColumn,
          ...styles.flexGrow1,
          ...styles.overflowXHidden,
        }}
      >
        {currentDialogConfig && (
          <ChatWindow currentDialogConfig={currentDialogConfig} />
        )}
      </div>
    </div>
  );
};

export default ChatPage;
