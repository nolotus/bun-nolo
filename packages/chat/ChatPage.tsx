// chat/ChatPage.tsx
import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { useAuth } from "auth/useAuth";
import { styles, themeStyles } from "render/ui/styles";
import { useParams } from "react-router-dom";
import { selectTheme } from "app/theme/themeSlice";
import withTranslations from "i18n/withTranslations";

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

  // 计算剩余的空间
  const remainingHeight = `calc(100dvh - ${theme.topbarHeight} - ${theme.topBarMargin} - ${theme.topBarPadding} * 2)`;

  return (
    <div
      style={{
        ...styles.flex,
        ...styles.overflowXHidden,
        height: remainingHeight, // 使用计算后的剩余高度
        ...themeStyles.surface1(theme),
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

export default withTranslations(ChatPage, ["chat", "ai"]);
