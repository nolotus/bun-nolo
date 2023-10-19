import React, { useEffect, useRef } from "react";
import { Message } from "./Message";

interface Message {
  role: string;
  content: string;
  image?: string;
}

interface MessagesDisplayProps {
  messages: Message[];
  tempMessages;
  scrollToBottom: () => void; // 新增
}

const MessagesDisplay: React.FC<MessagesDisplayProps> = ({
  messages,
  tempMessages,
}) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, tempMessages]);

  return (
    <div
      className="flex-grow flex flex-col space-y-4 p-3 overflow-y-auto max-w-full break-words"
      ref={messagesEndRef}
    >
      {messages.map((message, i) => (
        <Message
          key={i}
          content={message.content}
          role={message.role}
          image={message.image} // 新增代码
        />
      ))}
      <Message {...tempMessages} key={tempMessages.id} />
    </div>
  );
};

export default MessagesDisplay;
