import React, { useMemo } from "react";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { renderContentNode } from "render";
import { unified } from "unified";
import { MessageRole } from "./types";

const getColorClass = (type: MessageRole) => {
  if (type === "user") {
    return "text-blue-500";
  }
  return "text-neutral-600";
};

export const MessageContent: React.FC<{
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
  const colorClass = getColorClass(type);

  return (
    <div
      className={`py-2 px-4 rounded-lg mx-2 bg-neutral-100 ${colorClass} whitespace-pre-wrap`}
    >
      {type === "user" ? content : renderedContent}
    </div>
  );
};
