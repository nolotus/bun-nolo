import React, { useMemo } from "react";
import { useAppSelector } from "app/hooks";
import { renderContentNode } from "render";
import { messageProcessor } from "render/processor/messageProcessor";
import { selectTheme } from "app/theme/themeSlice";

export const MessageText = ({ content, role }) => {
  const theme = useAppSelector(selectTheme);
  const isDarkMode = useAppSelector((state) => state.theme.isDarkMode);

  const messageContainerStyle = {
    maxWidth: "70vw",
    whiteSpace: "pre-wrap",
    margin: "0 0.5rem",
  };

  const renderedContent = useMemo(() => {
    if (role === "self") return content;
    const mdast = messageProcessor.parse(content);
    return renderContentNode(mdast, { isDarkMode });
  }, [content, role, isDarkMode]);

  return <div style={messageContainerStyle}>{renderedContent}</div>;
};
