import React, { useEffect, useRef } from "react";
import { useAppSelector } from "app/hooks";
import { Message } from "./Message";
import { selectChat } from "../chatSlice";

interface Message {
  role: string;
  content: string;
  image?: string;
}

interface MessagesDisplayProps {
  messages: Message[];
  scrollToBottom: () => void; // 新增
}

const MessagesDisplay: React.FC<MessagesDisplayProps> = ({ messages }) => {
  const { tempMessage } = useAppSelector(selectChat);

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
      <Message {...tempMessage} key={tempMessage.id} />
    </div>
  );
};

export default MessagesDisplay;
