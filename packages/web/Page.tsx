import React, { useMemo } from "react";
import { useStore } from "app";
import { useParams } from "react-router-dom";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";

import { renderMdastNode } from "./renderMdastNode";

export const Page = () => {
  console.log("render");
  let params = useParams();
  const pageId = params.id;
  const data = useStore(pageId);
  const { content } = data;
  const mdast = useMemo(() => {
    const processor = unified().use(remarkParse).use(remarkGfm);
    return processor.parse(content);
  }, [content]);
  const renderedContent = useMemo(() => {
    return renderMdastNode(mdast, "1");
  }, [mdast]);
  return <div>{renderedContent}</div>;
};
