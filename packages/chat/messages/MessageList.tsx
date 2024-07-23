import React, { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector, useFetchData } from "app/hooks";
import { Spinner } from "@primer/react";
import { reverse } from "rambda";
import OpenProps from "open-props";

import { MessageItem } from "./MessageItem";
import { selectStreamMessages, selectMergedMessages } from "./selector";
import { initMessages } from "./messageSlice";

export const messageListStyle = {
  display: "flex",
  flexDirection: "column-reverse",
  gap: OpenProps.size2,
  overflow: "auto",
  height: "100vh",
  position: "relative",
  paddingRight: OpenProps.size12,
};
interface MessagesDisplayProps {
  id: string;
  source: string[];
}

const MessagesList: React.FC<MessagesDisplayProps> = ({ id, source }) => {
  const dispatch = useAppDispatch();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { data, isLoading, error } = useFetchData(id, { source });
  const streamingMessages = useAppSelector(selectStreamMessages);
  const messages = useAppSelector(selectMergedMessages);

  useEffect(() => {
    if (streamingMessages && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [streamingMessages, messages]);
  //even useEffect still have order
  useEffect(() => {
    dispatch(initMessages());
  }, [id, error]);

  useEffect(() => {
    if (data) {
      dispatch(initMessages(reverse(data.array)));
    }
  }, [data]);

  if (isLoading) {
    return <Spinner size={"large"} />;
  }
  if (error) {
    return <div style={{ height: "100vh" }}>{error.message}</div>;
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
