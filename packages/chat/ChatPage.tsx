// chat/ChatPage.tsx
import React from "react";
import { WorkspaceProvider } from "./contexts/WorkspaceContext";
import ChatPageContent from "./ChatPageContent";
import withTranslations from "i18n/withTranslations";

const ChatPage = () => {
  return (
    <WorkspaceProvider>
      <ChatPageContent />
    </WorkspaceProvider>
  );
};

export default withTranslations(ChatPage, ["chat", "ai"]);
