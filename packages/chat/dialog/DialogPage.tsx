import { useAppDispatch, useAppSelector } from "app/hooks";
import { useAuth } from "auth/useAuth";
import {
  clearDialogState,
  initDialog,
  selectCurrentDialogConfig,
} from "chat/dialog/dialogSlice";
import MessageInputContainer from "chat/messages/MessageInputContainer";
import MessagesList from "chat/messages/MessageList";
import { useEffect } from "react";
import { layout } from "render/styles/layout";
import { useMessages } from "../messages/hooks/useMessages";
import { browserDb } from "database/browser/db";
import { extractCustomId } from "core/prefix";
import { initMsgs } from "../messages/messageSlice";

// Loading组件
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

const DialogPage = ({ pageId }) => {
  const dispatch = useAppDispatch();

  const dialogId = extractCustomId(pageId);
  const { messages, loading } = useMessages(browserDb, dialogId);
  !loading && dispatch(initMsgs(messages));

  const auth = useAuth();

  if (!auth.user) {
    window.location.href = "/login";
  }

  useEffect(() => {
    pageId && dispatch(initDialog(pageId));

    return () => {
      dispatch(clearDialogState());
    };
  }, [auth.user, pageId]);

  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);

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
