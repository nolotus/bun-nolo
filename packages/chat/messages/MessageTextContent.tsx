import React, { useMemo } from "react";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { renderContentNode } from "render";
import { unified } from "unified";
import { MessageRole } from "./types";

export const MessageTextContent: React.FC<{
  type: MessageRole;
  content: string;
}> = ({ type, content }) => {
  const mdast = useMemo(() => {
    const processor = unified().use(remarkParse).use(remarkGfm);
    return processor.parse(content);
  }, [content]);

  const renderedContent = useMemo(() => {
    return renderContentNode(mdast);
  }, [mdast]);
  //增加闪烁，如果网络卡了

  return (
    <div
      className={`surface-1 mx-2 whitespace-pre-wrap rounded-lg px-4 py-2`}
      style={{ boxShadow: "var(--shadow-2)" }}
    >
      {type === "user" ? content : renderedContent}
    </div>
  );
};
