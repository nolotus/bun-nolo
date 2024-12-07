// chat/ChatPage.tsx
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { useAuth } from "auth/useAuth";
import { useParams } from "react-router-dom";
import { selectTheme } from "app/theme/themeSlice";
import withTranslations from "i18n/withTranslations";
import { stylePresets } from "render/styles/stylePresets";
import { themeStyles } from "render/ui/styles";
import {
  initDialog,
  selectCurrentDialogConfig,
  clearDialogState,
} from "chat/dialog/dialogSlice";
import ChatWindow from "./messages/MsgWindow";

const ChatPage = () => {
  const auth = useAuth();
  const { dialogId } = useParams();
  const dispatch = useAppDispatch();
  const theme = useAppSelector(selectTheme);

  useEffect(() => {
    if (!auth.user) {
      window.location.href = "/login";
      return;
    }

    dialogId && dispatch(initDialog({ dialogId }));

    // 组件卸载时清空数据
    return () => {
      dispatch(clearDialogState());
    };
  }, [auth.user, dialogId, dispatch]); // 添加 dispatch 到依赖数组

  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);

  if (!auth.user) {
    return null;
  }

  return (
    <div
      style={{
        ...stylePresets.flex,
        ...stylePresets.overflowXHidden,
        height: "100dvh",
        ...themeStyles.surface1(theme),
      }}
    >
      <div
        style={{
          ...stylePresets.flexColumn,
          ...stylePresets.flexGrow1,
          ...stylePresets.overflowXHidden,
        }}
      >
        {currentDialogConfig && (
          <ChatWindow currentDialogConfig={currentDialogConfig} />
        )}
      </div>
    </div>
  );
};

export default withTranslations(ChatPage, ["chat", "ai"]);
