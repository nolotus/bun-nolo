import { useAppSelector } from "app/hooks";
import React, { useEffect, useRef } from "react";

import { StreamingMessage } from "./StreamingMessage";
import { selectMessage } from "./selector";
import { Message } from "./types";

interface MessagesDisplayProps {
  messages: Message[];
  scrollToBottom: () => void; // 新增
}

const MessagesDisplay: React.FC<MessagesDisplayProps> = ({ messages }) => {
  const { tempMessage } = useAppSelector(selectMessage);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, tempMessage]);

  return (
    <div
      className="flex max-w-full flex-grow flex-col space-y-4 overflow-y-auto break-words p-3"
      ref={messagesEndRef}
    >
      {messages.map((message) => (
        <StreamingMessage
          id={message.id}
          key={message.id}
          content={message.content}
          role={message.role}
          image={message.image}
        />
      ))}
      <StreamingMessage
        {...tempMessage}
        key={tempMessage.id}
        id={tempMessage.id}
      />
    </div>
  );
};

export default MessagesDisplay;
