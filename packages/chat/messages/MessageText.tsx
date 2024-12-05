// MessageText.tsx
import React, { useState, useEffect } from "react";
import Editor from "create/editor/Editor";
import { markdownToSlate } from "create/editor/markdownToSlate";

export const MessageText = ({ content, role }) => {
  const messageContainerStyle = {
    maxWidth: "70vw",
    whiteSpace: "pre-wrap",
    margin: "0 0.5rem",
  };

  const [slateData, setSlateData] = useState(markdownToSlate(content));
  console.log("content", content);

  console.log("slateData", slateData);
  useEffect(() => {
    setSlateData(markdownToSlate(content));
  }, [content]);

  return (
    <div style={messageContainerStyle}>
      {role === "self" ? (
        content
      ) : (
        <Editor
          key={content} // 添加key,content变化会强制重新渲染
          initialValue={slateData}
          readOnly={true}
        />
      )}
    </div>
  );
};
