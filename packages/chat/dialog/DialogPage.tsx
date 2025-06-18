// /pages/DialogPage.tsx

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { useAuth } from "auth/hooks/useAuth";
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
import { browserDb } from "database/browser/db";
import { extractCustomId } from "core/prefix";
import { selectHeaderHeight, selectTheme } from "app/theme/themeSlice";
import { Link } from "react-router-dom";
import { RocketIcon } from "@primer/octicons-react";
import Button from "render/web/ui/Button";

const spinKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingSpinner = () => {
  const theme = useAppSelector(selectTheme);
  return (
    <>
      <style>{spinKeyframes}</style>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <div
          style={{
            border: `4px solid rgba(0, 0, 0, 0.1)`,
            borderLeftColor: theme.primary,
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            animation: "spin 1s linear infinite",
          }}
        />
      </div>
    </>
  );
};

const ErrorDisplay = ({ error }: { error: any }) => {
  const theme = useAppSelector(selectTheme);
  return (
    <div
      style={{
        padding: theme.space[5],
        color: theme.error,
        textAlign: "center",
      }}
    >
      加载消息出错: {error.message}
    </div>
  );
};

const NotLoggedIn = () => {
  const theme = useAppSelector(selectTheme);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        padding: theme.space[8],
        textAlign: "center",
        color: theme.textSecondary,
        backgroundColor: theme.background,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: theme.backgroundSecondary,
          borderRadius: theme.space[4],
          padding: theme.space[8],
          boxShadow: `0 4px 6px ${theme.shadowLight}`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: theme.space[6],
          }}
        >
          <RocketIcon size={48} style={{ color: theme.primary }} />
        </div>
        <h2
          style={{
            margin: `0 0 ${theme.space[4]} 0`,
            color: theme.text,
            fontSize: "24px",
            fontWeight: 600,
          }}
        >
          欢迎使用我们的服务
        </h2>
        <p
          style={{
            margin: `0 0 ${theme.space[6]} 0`,
            lineHeight: "1.5",
            fontSize: "16px",
          }}
        >
          请登录或注册以继续使用所有功能
        </p>
        <div
          style={{
            display: "flex",
            gap: theme.space[4],
            justifyContent: "center",
          }}
        >
          <Button
            as={Link}
            to="/login"
            variant="primary"
            style={{ width: "100px" }}
          >
            登录
          </Button>
          <Button
            as={Link}
            to="/signup"
            variant="secondary"
            style={{ width: "100px" }}
          >
            注册
          </Button>
        </div>
      </div>
    </div>
  );
};

const DialogPage = ({ pageKey }: { pageKey: string }) => {
  const dispatch = useAppDispatch();
  const { user, isLoggedIn } = useAuth();
  const dialogId = pageKey ? extractCustomId(pageKey) : null;

  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);
  const isLoadingInitial = useAppSelector(selectIsLoadingInitial);
  const error = useAppSelector(selectMessageError);
  const headerHeight = useAppSelector(selectHeaderHeight);
  const theme = useAppSelector(selectTheme);

  // --- 【修复】第一部分: 初始化 Effect ---
  // 这个 Effect 只负责在 pageKey 或 user 变化时加载数据。
  // 它没有清理函数，也不会因为自己触发的状态更新而反复执行。
  useEffect(() => {
    if (pageKey && user && dialogId) {
      // 这里的 dispatch 会触发组件重渲染，但因为依赖项不包含
      // 被改变的状态（如 currentDialogKey），所以不会导致循环。
      dispatch(initDialog(pageKey));
      dispatch(initMsgs({ dialogId, limit: 10, db: browserDb }));
    }
  }, [pageKey, user, dispatch, dialogId]); // 依赖于核心标识符

  // --- 【修复】第二部分: 清理 Effect ---
  // 这个 Effect 只在组件第一次挂载时运行一次，然后设置一个清理函数。
  // 这个清理函数只会在组件真正卸载（unmount）时执行。
  useEffect(() => {
    return () => {
      // 当你离开这个对话页面时，重置相关的状态。
      dispatch(clearDialogState());
      dispatch(resetMsgs());
    };
  }, [dispatch]); // dispatch 是稳定引用，所以这个 effect 只会在挂载和卸载时运行。

  const renderContent = () => {
    if (!isLoggedIn) return <NotLoggedIn />;
    // isLoadingInitial 会在 initMsgs pending 时变为 true
    if (isLoadingInitial) return <LoadingSpinner />;
    if (error) return <ErrorDisplay error={error} />;

    if (currentDialogConfig && dialogId) {
      return (
        <div
          style={{ display: "flex", flexDirection: "column", height: "100%" }}
        >
          <div style={{ flexGrow: 1, overflow: "hidden" }}>
            <MessagesList dialogId={dialogId} />
          </div>
          <MessageInputContainer />
        </div>
      );
    }

    // 初始状态或数据还未到达时的视图
    return (
      <div
        style={{
          textAlign: "center",
          padding: theme.space[5],
          color: theme.textSecondary,
        }}
      >
        选择一个对话开始聊天
      </div>
    );
  };

  return (
    <>
      {currentDialogConfig?.title && <title>{currentDialogConfig.title}</title>}
      <div
        style={{
          display: "flex",
          overflow: "hidden",
          height: `calc(100dvh - ${headerHeight}px)`,
          backgroundColor: theme.background,
        }}
      >
        <div
          style={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {renderContent()}
        </div>
      </div>
    </>
  );
};

export default DialogPage;
