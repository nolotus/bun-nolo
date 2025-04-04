import { useAppDispatch, useAppSelector } from "app/hooks";
import { useAuth } from "auth/hooks/useAuth";
import {
  clearDialogState,
  initDialog,
  selectCurrentDialogConfig,
} from "chat/dialog/dialogSlice";
import MessageInputContainer from "chat/web/MessageInputContainer";
import MessagesList from "chat/web/MessageList";
import { useEffect } from "react";
import { layout } from "render/styles/layout";
import { useMessages } from "../messages/hooks/useMessages";
import { browserDb } from "database/browser/db";
import { extractCustomId } from "core/prefix";
import { initMsgs, resetMsgs } from "../messages/messageSlice";

const LoadingSpinner = () => (
  <div
    style={{
      ...layout.flex,
      ...layout.justifyCenter,
      ...layout.alignCenter,
      height: "100%",
    }}
  >
    <div>Loading...</div>
  </div>
);

const DialogPage = ({ pageKey }) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const dialogId = extractCustomId(pageKey);
  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);

  // 使用 useMessages hook
  const { messages, loading } = useMessages(browserDb, dialogId);

  // 处理消息初始化
  useEffect(() => {
    if (!loading && messages.length > 0) {
      dispatch(initMsgs(messages));
    }
    return () => {
      dispatch(resetMsgs());
    };
  }, [loading, messages, dispatch]);

  // 处理对话初始化和清理
  useEffect(() => {
    if (pageKey && user) {
      dispatch(initDialog(pageKey));
    }

    return () => {
      dispatch(clearDialogState());
    };
  }, [user, pageKey, dispatch]);

  return (
    <>
      {currentDialogConfig?.title && <title>{currentDialogConfig.title}</title>}
      <div
        style={{
          ...layout.flex,
          ...layout.overflowXHidden,
          height: "calc(100dvh - 60px)",
        }}
      >
        <div
          style={{
            ...layout.flexColumn,
            ...layout.flexGrow1,
            ...layout.overflowXHidden,
          }}
        >
          {loading ? (
            <LoadingSpinner />
          ) : (
            currentDialogConfig && (
              <div
                style={{
                  ...layout.flexColumn,
                  ...layout.h100,
                  ...layout.overflowXHidden,
                }}
              >
                <div
                  style={{
                    ...layout.flexGrow1,
                    ...layout.overflowYAuto,
                    ...layout.flexColumn,
                  }}
                >
                  <MessagesList />
                </div>
                <MessageInputContainer />
              </div>
            )
          )}
        </div>
      </div>
    </>
  );
};

export default DialogPage;
