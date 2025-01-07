import { useAppDispatch, useAppSelector } from "app/hooks";
import { useAuth } from "auth/useAuth";
import {
  clearDialogState,
  initDialog,
  selectCurrentDialogConfig,
} from "chat/dialog/dialogSlice";
import MessageInputContainer from "chat/messages/MessageInputContainer";
import MessagesList from "chat/messages/MessageList";
//  chat/dialog/DialogPage
import { useEffect } from "react";
import { layout } from "render/styles/layout";

const DialogPage = ({ dialogId }) => {
  const auth = useAuth();
  const dispatch = useAppDispatch();
  if (!auth.user) {
    window.location.href = "/login";
  }

  useEffect(() => {
    dialogId && dispatch(initDialog(dialogId));

    // 组件卸载时清空数据
    return () => {
      dispatch(clearDialogState());
    };
  }, [auth.user, dialogId]);

  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);
  // 计算剩余的空间

  return (
    <>
      {/* <meta name="author" content="Josh" />
      <link rel="author" href="https://twitter.com/joshcstory/" />
      <meta name="keywords" content={post.keywords} /> */}
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
          {currentDialogConfig && (
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
          )}
        </div>
      </div>
    </>
  );
};

export default DialogPage
