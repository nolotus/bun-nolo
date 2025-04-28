import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { useAuth } from "auth/hooks/useAuth";
import {
  clearDialogState,
  initDialog,
  selectCurrentDialogConfig,
} from "chat/dialog/dialogSlice";
import MessageInputContainer from "chat/web/MessageInputContainer";
import MessagesList from "chat/web/MessageList";
import {
  initMsgs,
  selectIsLoadingInitial,
  selectMessageError,
} from "chat/messages/messageSlice";
import { browserDb } from "database/browser/db";
import { extractCustomId } from "core/prefix";
import { selectHeaderHeight, selectTheme } from "app/theme/themeSlice"; // 新增 selectTheme 导入以获取主题配置

// 加载旋转动画样式
const spinKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// 加载中旋转组件
const LoadingSpinner = () => {
  const theme = useAppSelector(selectTheme); // 获取当前主题配置

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
            borderLeftColor: theme.primary, // 使用主题的主色调作为加载动画的颜色
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

// 错误显示组件
const ErrorDisplay = ({ error }: { error: any }) => {
  const theme = useAppSelector(selectTheme); // 获取当前主题配置

  return (
    <div
      style={{
        padding: theme.space[5], // 使用主题中定义的空间尺寸
        color: theme.error, // 使用主题中定义的错误颜色
        textAlign: "center",
      }}
    >
      加载消息出错: {error.message}
    </div>
  );
};

// 对话页面组件
const DialogPage = ({ pageKey }: { pageKey: string }) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const dialogId = extractCustomId(pageKey);
  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);
  const isLoadingInitial = useAppSelector(selectIsLoadingInitial);
  const error = useAppSelector(selectMessageError);
  const headerHeight = useAppSelector(selectHeaderHeight); // 从主题中获取顶部高度
  const theme = useAppSelector(selectTheme); // 获取当前主题配置

  // 初始化对话和消息
  useEffect(() => {
    if (pageKey && user && dialogId) {
      dispatch(initDialog(pageKey));
      dispatch(initMsgs({ dialogId, limit: 15, db: browserDb }));
    }

    return () => {
      dispatch(clearDialogState());
    };
  }, [user, pageKey, dispatch, dialogId]);

  // 渲染内容逻辑
  const renderContent = () => {
    if (isLoadingInitial) {
      return <LoadingSpinner />;
    }
    if (error) {
      return <ErrorDisplay error={error} />;
    }
    if (currentDialogConfig) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <div style={{ flexGrow: 1, overflow: "hidden" }}>
            <MessagesList dialogId={dialogId} />
          </div>
          <MessageInputContainer />
        </div>
      );
    }
    return (
      <div
        style={{
          textAlign: "center",
          padding: theme.space[5], // 使用主题中定义的空间尺寸
          color: theme.textSecondary, // 使用主题中的次级文本颜色
        }}
      >
        正在加载对话信息...
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
          height: `calc(100dvh - ${headerHeight}px)`, // 使用从主题获取的顶部高度
          backgroundColor: theme.background, // 使用主题中的背景颜色
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
