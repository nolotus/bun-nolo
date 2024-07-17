import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { unified } from "unified";
import { visit } from "unist-util-visit";

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
const createProcessor = () =>
  unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkStringify)
    .use(remarkFrontmatter, [
      "yaml",
      "toml",
      { type: "json", fence: { open: "{", close: "}" } },
    ]);

export const getH1TextFromMdast = (mdast: MdastNode): string | null => {
  let h1Text: string | null = null;
  visit(mdast, "heading", (node: MdastNode) => {
    if (
      node.type === "heading" &&
      node.depth === 1 &&
      node.children &&
      node.children[0] &&
      node.children[0].type === "text"
    ) {
      h1Text = node.children[0].value as string;
      return false; // 停止访问
    }
  });
  return h1Text;
};

export interface YamlMdastNode extends MdastNode {
  type: "yaml";
  value?: string;
  // 根据实际节点结构，这里可能需要其他属性
}

export const getYamlValueFromMdast = (mdast: MdastNode): string | null => {
  let yamlValue: string | null = null;
  visit(mdast, "yaml", (node: YamlMdastNode) => {
    if (node.type === "yaml" && node.value) {
      yamlValue = node.value;
      return false; // 停止访问
    }
  });
  return yamlValue;
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
