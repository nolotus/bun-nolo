// pages/DialogPage.tsx

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "app/store";
import { useAuth } from "auth/hooks/useAuth";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RocketIcon } from "@primer/octicons-react";

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
import Button from "render/web/ui/Button";

// --- 子组件 ---

const spinKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingSpinner = () => (
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
          border: "4px solid var(--backgroundTertiary)",
          borderLeftColor: "var(--primary)",
          borderRadius: "50%",
          width: "30px",
          height: "30px",
          animation: "spin 1s linear infinite",
        }}
      />
    </div>
  </>
);

const ErrorDisplay = ({ error }: { error: any }) => {
  const { t } = useTranslation("common");
  return (
    <div
      style={{
        padding: "var(--space-5)",
        color: "var(--error)",
        textAlign: "center",
      }}
    >
      {t("errors.loadingMessages")}: {error.message}
    </div>
  );
};

const NotLoggedIn = () => {
  const { t } = useTranslation("auth");
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        padding: "var(--space-8)",
        textAlign: "center",
        color: "var(--textSecondary)",
        backgroundColor: "var(--background)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          backgroundColor: "var(--backgroundSecondary)",
          borderRadius: "var(--space-4)",
          padding: "var(--space-8)",
          boxShadow: "0 4px 6px var(--shadowLight)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "var(--space-6)",
          }}
        >
          <RocketIcon size={48} style={{ color: "var(--primary)" }} />
        </div>
        <h2
          style={{
            margin: "0 0 var(--space-4) 0",
            color: "var(--text)",
            fontSize: "24px",
            fontWeight: 600,
          }}
        >
          {t("welcomeTitle")}
        </h2>
        <p
          style={{
            margin: "0 0 var(--space-6) 0",
            lineHeight: "1.5",
            fontSize: "16px",
          }}
        >
          {t("welcomeHint")}
        </p>
        <div
          style={{
            display: "flex",
            gap: "var(--space-4)",
            justifyContent: "center",
          }}
        >
          <Button
            as={Link}
            to="/login"
            variant="primary"
            style={{ width: "100px" }}
          >
            {t("login")}
          </Button>
          <Button
            as={Link}
            to="/signup"
            variant="secondary"
            style={{ width: "100px" }}
          >
            {t("signup")}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ======================================================================
// 【核心组件】: DialogPage
// ======================================================================
const DialogPage = ({ pageKey }: { pageKey: string }) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation("chat");
  const { user, isLoggedIn } = useAuth();
  const dialogId = pageKey ? extractCustomId(pageKey) : null;

  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);
  const isLoadingInitial = useAppSelector(selectIsLoadingInitial);
  const error = useAppSelector(selectMessageError);

  // 初始化 Effect
  useEffect(() => {
    if (pageKey && user && dialogId) {
      dispatch(initDialog(pageKey));
      dispatch(initMsgs({ dialogId, limit: 10, db: browserDb }));
    }
  }, [pageKey, user, dispatch, dialogId]);

  // 清理 Effect
  useEffect(() => {
    return () => {
      dispatch(clearDialogState());
      dispatch(resetMsgs());
    };
  }, [dispatch]);

  const renderContent = () => {
    if (!isLoggedIn) return <NotLoggedIn />;
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
    return (
      <div
        style={{
          textAlign: "center",
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
          height: "100%", // 核心修复：填满 MainLayout 提供的容器
          backgroundColor: "var(--background)",
          overflow: "hidden", // 确保内容不会溢出此容器
        }}
      >
        {renderContent()}
      </div>
    </>
  );
};

export default DialogPage;
