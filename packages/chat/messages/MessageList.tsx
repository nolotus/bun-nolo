import { useAppSelector } from "app/hooks";
import React, { useEffect, useRef } from "react";
import Sizes from "open-props/src/sizes";

import { StreamingMessage } from "./StreamingMessage";
import { selectMessage } from "./selector";
import { MessageItem } from "./MessageItem";
interface MessagesDisplayProps {
  scrollToBottom: () => void;
}

const MessagesList: React.FC<MessagesDisplayProps> = ({ messageIds }) => {
  const { tempMessage } = useAppSelector(selectMessage);

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
        paddingRight: Sizes["--size-fluid-8"],
        paddingLeft: Sizes["--size-fluid-8"],
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
