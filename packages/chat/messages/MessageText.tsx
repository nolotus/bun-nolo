import React, { useMemo } from "react";
import { useAppSelector } from "app/hooks";
import { renderContentNode } from "render";
import styled from "styled-components";
import { messageProcessor } from "render/processor/messageProcessor";

const MessageContainer = styled.div`
  max-width: 70vw;
  white-space: pre-wrap;
  margin: 0 0.5rem;
`;

export const MessageText = ({ content, role }) => {
  const isDarkMode = useAppSelector((state) => state.theme.isDarkMode);

  const renderedContent = useMemo(() => {
    if (role === "self") return content;
    const mdast = messageProcessor.parse(content);
    return renderContentNode(mdast, { isDarkMode });
  }, [content, role, isDarkMode]);

  return <MessageContainer>{renderedContent}</MessageContainer>;
};
