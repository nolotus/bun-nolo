// import { useMemo } from 'react';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
type MdastNode = MdastParent | MdastLeaf;

interface MdastParent {
  type: string;
  children: MdastNode[];
  depth?: number;
  [key: string]: any;
}

interface MdastLeaf {
  type: string;
  value?: any;
  depth?: number;
  [key: string]: any;
}
const createProcessor = () => unified().use(remarkParse).use(remarkGfm).use(remarkStringify)
export const getH1TextFromMdast = (mdast: MdastNode): string | null => {
  let h1Text: string | null = null;
  visit(mdast, 'heading', (node: MdastNode) => {
    if (
      node.type === 'heading' &&
      node.depth === 1 &&
      node.children &&
      node.children[0] &&
      node.children[0].type === 'text'
    ) {
      h1Text = node.children[0].value as string;
      return false; // 停止访问
    }
  });
  return h1Text;
};


// 主要的自定义Hook
export const markdownToMdast = (content: string) => {
  const processor = createProcessor();
  return processor.parse(content);
};
export const mdastToMarkdown = (mdast) => {
  const processor = createProcessor();
  return processor.stringify(mdast);
};