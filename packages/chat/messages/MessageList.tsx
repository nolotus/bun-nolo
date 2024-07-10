import React, { useEffect, useRef } from "react";
import { useAppSelector } from "app/hooks";
import { MessageItem } from "./MessageItem";
import { selectMessage } from "./selector";
import { ChatContainerPaddingRight } from "../styles";
import OpenProps from "open-props";

interface MessagesDisplayProps {
  messages: Array<{ id: string; content?: string }>;
}

const MessagesList: React.FC<MessagesDisplayProps> = ({ messages }) => {
  const isMessageStreaming = useAppSelector(selectMessage).isMessageStreaming;
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isMessageStreaming && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [isMessageStreaming, messages]);

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: "column-reverse",
        paddingRight: ChatContainerPaddingRight,
        paddingLeft: OpenProps.size5,
        gap: OpenProps.size2,
        overflow: "auto",
        height: "100vh",
        position: "relative",
      }}
    >
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
};

export default React.memo(MessagesList);
