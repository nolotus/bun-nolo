import { useAppSelector } from "app/hooks";
import React, { useEffect, useRef } from "react";

import { StreamingMessage } from "./StreamingMessage";
import { selectMessage } from "./selector";
import { MessageItem } from "./MessageItem";
interface MessagesDisplayProps {
  scrollToBottom: () => void; // 新增
}

const MessagesList: React.FC<MessagesDisplayProps> = ({ messageIdsList }) => {
  const { tempMessage } = useAppSelector(selectMessage);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messageIdsList, tempMessage]);

  return (
    <div
      className="flex max-w-full flex-grow flex-col space-y-4 overflow-y-auto break-words p-3"
      ref={messagesEndRef}
    >
      {messageIdsList.map((id: string) => {
        return <MessageItem id={id} key={id} />;
      })}
      {tempMessage && (
        <StreamingMessage
          {...tempMessage}
          key={tempMessage.id}
          id={tempMessage.id}
        />
      )}
    </div>
  );
};

export default MessagesList;
