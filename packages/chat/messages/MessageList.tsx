import { useAppSelector } from "app/hooks";
import React, { useEffect, useRef } from "react";
import Sizes from "open-props/src/sizes";

import { StreamingMessage } from "./StreamingMessage";
import { MessageItem } from "./MessageItem";
import { selectCurrentDialogConfig } from "../dialog/dialogSlice";
import {
  selectMessageFailed,
  selectMessageList,
  selectMessage,
} from "./selector";
import { ChatContainerPaddingRight } from "../styles";
interface MessagesDisplayProps {
  scrollToBottom: () => void;
}

const MessagesList: React.FC<MessagesDisplayProps> = () => {
  const { tempMessage } = useAppSelector(selectMessage);
  const messageList = useAppSelector(selectMessageList);

  const messageFailed = useAppSelector(selectMessageFailed);
  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messageList, tempMessage]);
  return (
    <div
      className="flex  flex-grow flex-col space-y-4 overflow-y-auto break-words p-3"
      ref={messagesEndRef}
      style={{
        paddingRight: ChatContainerPaddingRight,
        paddingLeft: Sizes["--size-5"],
      }}
    >
      {messageFailed ? (
        "failed"
      ) : (
        <>
          {messageList?.map((id: string) => {
            return <MessageItem id={id} key={id} />;
          })}
          {tempMessage && (
            <StreamingMessage
              {...tempMessage}
              key={tempMessage.id}
              id={tempMessage.id}
            />
          )}
        </>
      )}
    </div>
  );
};

export default MessagesList;
