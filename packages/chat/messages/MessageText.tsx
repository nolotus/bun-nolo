import { useAppSelector } from "app/hooks";
import React, { useMemo } from "react";
import { renderContentNode } from "render";
import { messageProcessor } from "render/processor/messageProcessor";

export const MessageText: React.FC<{
  content: string;
}> = ({ content }) => {
  const isDarkMode = useAppSelector((state) => state.theme.isDarkMode);
  const mdast = useMemo(() => {
    return messageProcessor.parse(content);
  }, [content]);

  const renderedContent = useMemo(() => {
    return renderContentNode(mdast, { isDarkMode });
  }, [mdast, isDarkMode]);
  //增加闪烁，如果网络卡了
  return (
    <div
      className={`mx-2 whitespace-pre-wrap `}
      style={{ maxWidth: "70vw", whiteSpace: "preserve" }}
    >
      {renderedContent}
    </div>
  );
};
