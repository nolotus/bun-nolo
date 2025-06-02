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
            style={{
              width: "100px",
            }}
          >
            登录
          </Button>

          <Button
            as={Link}
            to="/signup"
            variant="secondary"
            style={{
              width: "100px",
            }}
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
  const dialogId = extractCustomId(pageKey);
  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);
  const isLoadingInitial = useAppSelector(selectIsLoadingInitial);
  const error = useAppSelector(selectMessageError);
  const headerHeight = useAppSelector(selectHeaderHeight);
  const theme = useAppSelector(selectTheme);

  useEffect(() => {
    if (pageKey && user && dialogId) {
      dispatch(initDialog(pageKey));
      dispatch(initMsgs({ dialogId, limit: 10, db: browserDb }));
    }
    return () => {
      dispatch(clearDialogState());
    };
  }, [user, pageKey, dispatch, dialogId]);

  const renderContent = () => {
    if (!isLoggedIn) return <NotLoggedIn />;
    if (isLoadingInitial) return <LoadingSpinner />;
    if (error) return <ErrorDisplay error={error} />;
    if (currentDialogConfig) {
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
    return (
      <div
        style={{
          textAlign: "center",
          padding: theme.space[5],
          color: theme.textSecondary,
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
