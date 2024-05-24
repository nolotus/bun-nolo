import React, { useMemo } from "react";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { renderContentNode } from "render";
import { unified } from "unified";

export const MessageText: React.FC<{
  content: string;
}> = ({ content }) => {
  const mdast = useMemo(() => {
    const processor = unified().use(remarkParse).use(remarkGfm);
    return processor.parse(content);
  }, [content]);

  const renderedContent = useMemo(() => {
    return renderContentNode(mdast);
  }, [mdast]);
  //增加闪烁，如果网络卡了
  return <div className={`mx-2 whitespace-pre-wrap `}>{renderedContent}</div>;
};
