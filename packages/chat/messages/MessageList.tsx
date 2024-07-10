import React, { useEffect, useRef } from "react";
import { useAppSelector } from "app/hooks";
import { MessageItem } from "./MessageItem";
import { selectStreamMessages } from "./selector";
import { ChatContainerPaddingRight } from "../styles";
import OpenProps from "open-props";

interface MessagesDisplayProps {
  messages: Array<{ id: string; content?: string }>;
}

const MessagesList: React.FC<MessagesDisplayProps> = ({ messages }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const streamingMessages = useAppSelector(selectStreamMessages);
  useEffect(() => {
    if (streamingMessages && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [streamingMessages, messages]);

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
