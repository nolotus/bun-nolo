import React from "react";
import { styles } from "render/ui/styles";
import MessagesList from "./MessageList";
import MessageInputContainer from "./MessageInputContainer";

const ChatWindow: React.FC = () => {
  const chatContainerStyle = {
    ...styles.flexColumn,
    ...styles.h100,
    ...styles.overflowXHidden,
  };

  const messageListContainerStyle = {
    ...styles.flexGrow1,
    ...styles.overflowYAuto,
    ...styles.flexColumn,
  };

  return (
    <div style={chatContainerStyle}>
      <div style={messageListContainerStyle}>
        <MessagesList />
      </div>
      <MessageInputContainer />
    </div>
  );
};

export default ChatWindow;
