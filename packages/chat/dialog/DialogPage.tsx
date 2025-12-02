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
        <Suspense fallback={<PageLoading />}>
          <GuestGuide />
        </Suspense>
      );
    }

    if (isLoadingInitial) return <PageLoading />;

    if (error) {
      return (
        <Suspense fallback={<PageLoading />}>
          <ErrorView error={error} />
        </Suspense>
      );
    }

    if (currentDialogConfig && dialogId) {
      return (
        <>
          <MessagesList dialogId={dialogId} />
          <MessageInputContainer />
        </>
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
          minHeight: "100%",
          backgroundColor: "var(--background)",
        }}
      >
        {renderContent()}
      </div>
    </>
  );
};

export default DialogPage;
