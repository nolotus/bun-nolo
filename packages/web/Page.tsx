import { useStore } from 'app';
import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { renderContentNode } from 'render';
import { unified } from 'unified';

const Page = () => {
  let params = useParams();
  const pageId = params.id;
  const data = useStore(pageId);
  const { content } = data;
  const mdast = useMemo(() => {
    const processor = unified().use(remarkParse).use(remarkGfm);
    return processor.parse(content);
  }, [content]);
  const renderedContent = useMemo(() => {
    return renderContentNode(mdast);
  }, [mdast]);
  return <div>{renderedContent}</div>;
};
export default Page;
