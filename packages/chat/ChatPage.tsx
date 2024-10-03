// chat/ChatPage.tsx
import React from "react";
import { WorkspaceProvider } from "./contexts/WorkspaceContext";
import ChatPageContent from "./ChatPageContent";

const ChatPage = () => {
  return (
    <WorkspaceProvider>
      <ChatPageContent />
    </WorkspaceProvider>
  );
};

export default ChatPage;
