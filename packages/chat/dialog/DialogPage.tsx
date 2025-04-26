import React, { useEffect } from "react"; // Import React
import { useAppDispatch, useAppSelector } from "app/hooks";
import { useAuth } from "auth/hooks/useAuth";
import {
  clearDialogState,
  initDialog,
  selectCurrentDialogConfig,
} from "chat/dialog/dialogSlice";
import MessageInputContainer from "chat/web/MessageInputContainer";
import MessagesList from "chat/web/MessageList";
import { initMsgs, selectMessagesState } from "chat/messages/messageSlice";
import { browserDb } from "database/browser/db";
import { extractCustomId } from "core/prefix";

// --- Loading Spinner Component ---
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
          border: "4px solid rgba(0, 0, 0, 0.1)",
          borderLeftColor: "#09f",
          borderRadius: "50%",
          width: "30px",
          height: "30px",
          animation: "spin 1s linear infinite",
        }}
      ></div>
    </div>
  </>
);

// --- DialogPage Component ---
const DialogPage = ({ pageKey }) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const dialogId = extractCustomId(pageKey);
  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);

  // --- Get messages state from Redux ---
  const { isLoadingInitial, isLoadingOlder, hasMoreOlder, error } =
    useAppSelector(selectMessagesState);

  // --- Dialog and messages initialization ---
  useEffect(() => {
    if (pageKey && user) {
      dispatch(initDialog(pageKey));
      dispatch(initMsgs({ dialogId, db: browserDb }));
    }
    return () => {
      dispatch(clearDialogState());
    };
  }, [user, pageKey, dialogId, dispatch]);

  // --- Render Error (Optional) ---
  const renderError = () =>
    error ? (
      <div style={{ padding: "20px", color: "red", textAlign: "center" }}>
        加载消息出错: {error.message}
      </div>
    ) : null;

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
            overflow: "hidden",
          }}
        >
          {/* --- Conditional Rendering based on initial load state --- */}
          {isLoadingInitial ? (
            <LoadingSpinner />
          ) : error ? (
            renderError()
          ) : (
            // Render chat only when initial load is done and no error
            currentDialogConfig && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    flexGrow: 1,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* --- Pass dialogId to MessagesList --- */}
                  <MessagesList dialogId={dialogId} />
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
