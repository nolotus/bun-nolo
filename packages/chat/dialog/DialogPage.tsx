// chat/dialog/DialogPage.tsx
import React, { useEffect, Suspense } from "react";
import { useAppDispatch, useAppSelector } from "app/store";
import { useAuth } from "auth/hooks/useAuth";
import { useTranslation } from "react-i18next";

import {
  clearDialogState,
  initDialog,
  selectCurrentDialogConfig,
} from "chat/dialog/dialogSlice";
import MessageInputContainer from "chat/web/MessageInputContainer";
import MessagesList from "chat/messages/web/MessageList";
import {
  initMsgs,
  resetMsgs,
  selectIsLoadingInitial,
  selectMessageError,
} from "chat/messages/messageSlice";
import { extractCustomId } from "core/prefix";
import PageLoading from "render/web/ui/PageLoading";

// --- Lazy Load Components ---
const GuestGuide = React.lazy(() => import("render/web/ui/GuestGuide"));
const ErrorView = React.lazy(() => import("render/web/ui/ErrorView"));

const DialogPage = ({ pageKey }: { pageKey: string }) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("chat");
  const { user, isLoggedIn } = useAuth();
  const dialogId = pageKey ? extractCustomId(pageKey) : null;

  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);
  const isLoadingInitial = useAppSelector(selectIsLoadingInitial);
  const error = useAppSelector(selectMessageError);

  useEffect(() => {
    if (pageKey && user && dialogId) {
      dispatch(initDialog(pageKey));
      dispatch(initMsgs({ dialogId, limit: 20 }));
    }
  }, [pageKey, user?.userId, dispatch, dialogId]);

  useEffect(() => {
    return () => {
      dispatch(clearDialogState());
      dispatch(resetMsgs());
    };
  }, [dispatch]);

  const renderContent = () => {
    if (!isLoggedIn) {
      return (
        <Suspense fallback={<PageLoading message="检查权限" />}>
          <div style={{ flex: 1 }}>
            {" "}
            {/* 撑开高度 */}
            <GuestGuide />
          </div>
        </Suspense>
      );
    }

    if (isLoadingInitial) return <PageLoading message="加载对话数据" />;

    if (error) {
      return (
        <Suspense fallback={<PageLoading />}>
          <div style={{ flex: 1 }}>
            <ErrorView error={error} />
          </div>
        </Suspense>
      );
    }

    if (currentDialogConfig && dialogId) {
      return (
        <>
          {/* 
             关键修改：
             给消息列表包裹一个 div，并设置 flex: 1。
             这样当消息很少时，这个 div 会自动伸展占据空白区域，
             把下方的 MessageInputContainer 挤到最底部。
          */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <MessagesList dialogId={dialogId} />
          </div>

          {/* 输入框组件，会自动呆在该在的地方 */}
          <MessageInputContainer />
        </>
      );
    }

    return (
      <div
        style={{
          flex: 1, // 同样撑开，保持居中逻辑正常
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "var(--space-5)",
          color: "var(--textSecondary)",
        }}
      >
        {t("selectADialog")}
      </div>
    );
  };

  return (
    <>
      {currentDialogConfig?.title && <title>{currentDialogConfig.title}</title>}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          // 关键修改：
          // 确保容器至少占据可视窗口减去头部的高度。
          // 配合 MainLayout 的 overflow-y: auto，这会创造一个
          // “内容少时占满屏，内容多时可滚动”的效果。
          minHeight: "calc(100vh - var(--headerHeight))",
          backgroundColor: "var(--background)",
          position: "relative",
        }}
      >
        {renderContent()}
      </div>
    </>
  );
};

export default DialogPage;
