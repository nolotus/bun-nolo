// MessageText.tsx
import React from "react";
import { useAppSelector } from "app/hooks";
import Editor from "create/editor/Editor";

export const MessageText = ({ content, role }) => {
  const messageContainerStyle = {
    maxWidth: "70vw",
    whiteSpace: "pre-wrap",
    margin: "0 0.5rem",
  };

  return (
    <div style={messageContainerStyle}>
      {role === "self" ? content : <Editor markdown={content} />}
    </div>
  );
};
