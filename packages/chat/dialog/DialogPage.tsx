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
import { useMessages } from "../messages/hooks/useMessages";
import { browserDb } from "database/browser/db";
import { extractCustomId } from "core/prefix";
import { initMsgs, resetMsgs } from "../messages/messageSlice";

// 定义旋转动画的 keyframes (可以在组件外部或内部定义，这里放在外部)
const spinKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingSpinner = () => (
  <>
    {/* 将 keyframes 注入到 style 标签中 */}
    <style>{spinKeyframes}</style>
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      {/* 简单的旋转加载动画 */}
      <div
        style={{
          border: "4px solid rgba(0, 0, 0, 0.1)", // 浅色背景边框
          borderLeftColor: "#09f", // 加载动画颜色 (可以根据你的主题修改)
          borderRadius: "50%",
          width: "30px",
          height: "30px",
          animation: "spin 1s linear infinite", // 应用动画
        }}
      ></div>
    </div>
  </>
);

const DialogPage = ({ pageKey }) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const dialogId = extractCustomId(pageKey);
  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);

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
          display: "flex",
          overflowX: "hidden",
          height: "calc(100dvh - 60px)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            overflowX: "hidden",
          }}
        >
          {loading ? (
            <LoadingSpinner />
          ) : (
            currentDialogConfig && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                  overflowX: "hidden",
                }}
              >
                <div
                  style={{
                    flexGrow: 1,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
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
