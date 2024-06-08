import { useAppSelector } from "app/hooks";
import React, { useMemo } from "react";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { renderContentNode } from "render";
import { unified } from "unified";
const processor = unified().use(remarkParse).use(remarkGfm);
export const MessageText: React.FC<{
  content: string;
}> = ({ content }) => {
  const isDarkMode = useAppSelector((state) => state.theme.isDarkMode);
  const mdast = useMemo(() => {
    return processor.parse(content);
  }, [content]);

  const renderedContent = useMemo(() => {
    return renderContentNode(mdast, { isDarkMode });
  }, [mdast, isDarkMode]);
  //增加闪烁，如果网络卡了
  return <div className={`mx-2 whitespace-pre-wrap `}>{renderedContent}</div>;
};
