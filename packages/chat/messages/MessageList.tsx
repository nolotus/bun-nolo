import { useAppSelector } from "app/hooks";
import React, { useEffect, useRef } from "react";
import Sizes from "open-props/src/sizes";

import { StreamingMessage } from "./StreamingMessage";
import { selectMessage } from "./selector";
import { MessageItem } from "./MessageItem";
interface MessagesDisplayProps {
  scrollToBottom: () => void;
}

const MessagesList: React.FC<MessagesDisplayProps> = () => {
  const { tempMessage } = useAppSelector(selectMessage);
  const messageIds = useAppSelector((state) => state.message.ids);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messageIds, tempMessage]);
  return (
    <div
      className="flex  flex-grow flex-col space-y-4 overflow-y-auto break-words p-3"
      ref={messagesEndRef}
      style={{
        paddingRight: Sizes["--size-13"],
        paddingLeft: Sizes["--size-13"],
      }}
    >
      {messageIds.map((id: string) => {
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
