import { useMemo } from 'react';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

// 创建处理器
const createProcessor = () => unified().use(remarkParse).use(remarkGfm);

// 获取H1标题文本
const getH1TextFromMdast = (mdast, setTitle) => {
  visit(mdast, 'heading', (node) => {
    if (
      node.depth === 1 &&
      node.children[0] &&
      node.children[0].type === 'text'
    ) {
      const h1Text = node.children[0].value;
      setTitle(h1Text);
    }
  });
};

// 主要的自定义Hook
export const useMarkdownProcessor = (
  content: string,
  setTitle: (title: string) => void,
) => {
  const mdast = useMemo(() => {
    const processor = createProcessor();
    return processor.parse(content);
  }, [content]);

  useMemo(() => {
    getH1TextFromMdast(mdast, setTitle);
  }, [mdast, setTitle]);

  return mdast;
};
