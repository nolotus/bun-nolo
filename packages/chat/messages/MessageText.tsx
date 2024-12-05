// MessageText.tsx
import React, { useState, useEffect, useMemo } from "react";
import Editor from "create/editor/Editor";
import { markdownToSlate } from "create/editor/markdownToSlate";

export const MessageText = ({ content, role }) => {
  const messageContainerStyle = {
    maxWidth: "70vw",
    whiteSpace: "pre-wrap",
    margin: "0 0.5rem",
  };

  const slateData = useMemo(() => markdownToSlate(content), [content]);

  return (
    <div style={messageContainerStyle}>
      {role === "self" ? (
        content
      ) : (
        <Editor
          key={content} // 保留 key 的方式
          initialValue={slateData}
          readOnly={true}
        />
      )}
    </div>
  );
};
