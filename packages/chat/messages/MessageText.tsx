import { useAppSelector } from "app/hooks";
import React, { useMemo } from "react";
import { renderContentNode } from "render";
import styled from "styled-components";

const MessageContainer = styled.div`
  max-width: 70vw;
  white-space: pre-wrap;
  margin-left: 0.5rem;
  margin-right: 0.5rem;
`;

export const MessageText: React.FC<{
  content: string;
  processor: { parse: (content: string) => any };
}> = ({ content, processor }) => {
  const isDarkMode = useAppSelector((state) => state.theme.isDarkMode);

  const mdast = useMemo(() => {
    return processor.parse(content);
  }, [content, processor]);

  const renderedContent = useMemo(() => {
    return renderContentNode(mdast, { isDarkMode });
  }, [mdast, isDarkMode]);

  return <MessageContainer>{renderedContent}</MessageContainer>;
};
