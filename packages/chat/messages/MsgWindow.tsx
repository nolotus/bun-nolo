import React from "react";
import { stylePresets } from "render/styles/stylePresets";

import MessagesList from "./MessageList";
import MessageInputContainer from "./MessageInputContainer";

const ChatWindow: React.FC = () => {
  const chatContainerStyle = {
    ...stylePresets.flexColumn,
    ...stylePresets.h100,
    ...stylePresets.overflowXHidden,
  };

  const messageListContainerStyle = {
    ...stylePresets.flexGrow1,
    ...stylePresets.overflowYAuto,
    ...stylePresets.flexColumn,
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
