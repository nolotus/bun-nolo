import React, { useEffect } from "react";
// Optional: For managing head tags like title
// import { Helmet } from "react-helmet-async";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { useAuth } from "auth/hooks/useAuth";
import {
  clearDialogState,
  initDialog,
  selectCurrentDialogConfig,
} from "chat/dialog/dialogSlice";
import MessageInputContainer from "chat/web/MessageInputContainer";
import MessagesList from "chat/web/MessageList"; // Keep MessagesList import
import {
  initMsgs,
  selectIsLoadingInitial, // Import specific selectors for clarity
  selectMessageError, // Import specific selectors for clarity
} from "chat/messages/messageSlice";
import { browserDb } from "database/browser/db";
import { extractCustomId } from "core/prefix";

// --- Loading Spinner Component (Consider moving to a separate file) ---
const spinKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
const LoadingSpinner = () => (
  <>
    <style>{spinKeyframes}</style> {/* Keyframes needed */}
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%", // Spinner needs height context
      }}
    >
      <div
        style={{
          border: "4px solid rgba(0, 0, 0, 0.1)",
          borderLeftColor: "#09f", // Or use theme color
          borderRadius: "50%",
          width: "30px",
          height: "30px",
          animation: "spin 1s linear infinite",
        }}
      />
    </div>
  </>
);

// --- Error Display Component ---
const ErrorDisplay = ({ error }) => (
  <div style={{ padding: "20px", color: "red", textAlign: "center" }}>
    加载消息出错: {error.message}
  </div>
);

// --- DialogPage Component ---
const DialogPage = ({ pageKey }) => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const dialogId = extractCustomId(pageKey); // Derived from pageKey

  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);
  const isLoadingInitial = useAppSelector(selectIsLoadingInitial); // Use specific selector
  const error = useAppSelector(selectMessageError); // Use specific selector

  // --- Dialog and messages initialization ---
  useEffect(() => {
    let isMounted = true;
    if (pageKey && user && dialogId) {
      console.log(
        `DialogPage: Initializing for pageKey: ${pageKey}, dialogId: ${dialogId}`
      );
      dispatch(initDialog(pageKey));
      dispatch(initMsgs({ dialogId, db: browserDb }));
    }

    // Cleanup function
    return () => {
      isMounted = false;
      // Clear dialog state when component unmounts or pageKey/user changes significantly
      console.log(`DialogPage: Cleaning up for pageKey: ${pageKey}`);
      dispatch(clearDialogState());
      // Consider resetting messages too if that's the desired behavior on page change
      // dispatch(resetMsgs()); // Uncomment if messages should clear completely
    };
    // dialogId is derived from pageKey, so only pageKey and user are needed here
  }, [user, pageKey, dispatch, dialogId]); // Keep dialogId if initMsgs needs stable reference

  // --- Render Logic ---
  const renderContent = () => {
    // 1. Initial Loading State
    if (isLoadingInitial) {
      return <LoadingSpinner />;
    }

    // 2. Error State (after initial load attempt)
    if (error) {
      return <ErrorDisplay error={error} />;
    }

    // 3. Success State (Dialog config loaded)
    if (currentDialogConfig) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%", // Occupy full available height
          }}
        >
          {/* Messages List occupies remaining space */}
          <div style={{ flexGrow: 1, overflow: "hidden" }}>
            {/* Pass dialogId explicitly */}
            <MessagesList dialogId={dialogId} />
          </div>
          {/* Input container at the bottom */}
          <MessageInputContainer />
        </div>
      );
    }

    // 4. Fallback (e.g., config not loaded yet, but not loading/error)
    // This state might indicate an issue if it persists.
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        正在加载对话信息...
      </div>
    ); // Or null, or a different placeholder
  };

  return (
    <>
      {/* Optional: Use Helmet for better title management */}
      {/* <Helmet>
        <title>{currentDialogConfig?.title || "Chat"}</title>
      </Helmet> */}
      {currentDialogConfig?.title && <title>{currentDialogConfig.title}</title>}

      {/* Main layout container */}
      <div
        style={{
          display: "flex",
          overflow: "hidden", // Changed overflowX to overflow
          height: "calc(100dvh - 60px)", // Assuming 60px is header height
          backgroundColor: "var(--background-color, #fff)", // Use theme background
        }}
      >
        {/* Inner container taking up available space */}
        <div
          style={{
            flexGrow: 1,
            display: "flex", // Needed for spinner centering
            flexDirection: "column",
            overflow: "hidden", // Prevent content overflow issues
          }}
        >
          {renderContent()}
        </div>
      </div>
    </>
  );
};

export default DialogPage;
