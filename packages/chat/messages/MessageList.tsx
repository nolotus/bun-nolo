import { useAppSelector } from "app/hooks";
import React, { useEffect, useRef } from "react";
import OpenProps from "open-props";

import { StreamingMessage } from "./StreamingMessage";
import { MessageItem } from "./MessageItem";
import { selectMessage } from "./selector";
import { ChatContainerPaddingRight } from "../styles";

interface MessagesDisplayProps {
  messageList: string[];
}

const MessagesList: React.FC<MessagesDisplayProps> = ({ messageList }) => {
  const { tempMessage } = useAppSelector(selectMessage);
  const { isMessageStreaming } = useAppSelector(selectMessage);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [isMessageStreaming]);

  return (
    <div
      className="break-words"
      ref={messagesEndRef}
      style={{
        display: "flex",
        flexDirection: "column-reverse",
        paddingRight: ChatContainerPaddingRight,
        paddingLeft: OpenProps.size5,
        gap: OpenProps.size2,
        overflow: "auto",
        height: "100vh",
      }}
    >
      {tempMessage && (
        <StreamingMessage
          {...tempMessage}
          key={tempMessage.id}
          id={tempMessage.id}
        />
      )}
      {messageList.map((id: string) => {
        return <MessageItem id={id} key={id} />;
      })}
    </div>
  );
};

export default MessagesList;
