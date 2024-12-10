// chat/MessagesList.tsx
import React, { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector, useFetchData } from "app/hooks";
import { Spinner } from "@primer/react";
import { reverse } from "rambda";
import OpenProps from "open-props";
import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";

import { MessageItem } from "./MessageItem";
import { selectStreamMessages, selectMergedMessages } from "./selector";
import { initMessages } from "./messageSlice";
import { COLORS } from "render/styles/colors";
export const messageListStyle = {
  display: "flex",
  flexDirection: "column-reverse",
  gap: OpenProps.size2,
  overflowY: "auto",
  padding: "20px 20%",
  paddingBottom: "10px",
  height: "100%",
  position: "relative",
  backgroundColor: COLORS.background,
  scrollBehavior: "smooth",
  scrollbarWidth: "thin",
  scrollbarColor: `${COLORS.border} transparent`,
};

const MessagesList: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentDialogConfig = useAppSelector(selectCurrentDialogConfig);
  const messages = useAppSelector(selectMergedMessages);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const id = currentDialogConfig.messageListId;

  if (!id) {
    return <div>mei id</div>;
  }

  const { data, isLoading, error } = useFetchData(id);
  const streamingMessages = useAppSelector(selectStreamMessages);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  //todo change to when first streaming
  useEffect(() => {
    if (streamingMessages) {
      scrollToBottom();
    }
  }, [streamingMessages, messages]);

  useEffect(() => {
    if (data) {
      dispatch(initMessages(reverse(data.array)));
    }
    return () => {
      dispatch(initMessages());
    };
  }, [data]);

  if (isLoading) {
    return <Spinner size={"large"} />;
  }

  if (error) {
    return <div style={{ height: "100%" }}>{error.message}</div>;
  }

  return (
    <div ref={containerRef} style={messageListStyle}>
      {messages.map((message) => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
};

export default MessagesList;
