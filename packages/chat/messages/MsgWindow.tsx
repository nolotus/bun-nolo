import React from "react";
import { stylePresets } from "render/styles/stylePresets";

import MessagesList from "./MessageList";
import MessageInputContainer from "./MessageInputContainer";
import { layout } from "render/styles/layout";

const ChatWindow: React.FC = () => {
  const chatContainerStyle = {
    ...layout.flexColumn,
    ...stylePresets.h100,
    ...layout.overflowXHidden,
  };

  const messageListContainerStyle = {
    ...layout.flexGrow1,
    ...stylePresets.overflowYAuto,
    ...layout.flexColumn,
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
