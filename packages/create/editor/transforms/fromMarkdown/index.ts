// create/editor/transforms/fromMarkdown.ts

import { processInlineNodes } from "./inline";
import { transformTable } from "./table";

interface SlateNode {
  type: string;
  children: Array<any>;
  text?: string;
  bold?: boolean;
  italic?: boolean;
  ordered?: boolean;
  url?: string;
  language?: string | null;
  alt?: string;
  title?: string;
  header?: boolean;
  checked?: boolean;
  html?: string;
  start?: number;
  value?: number;
  columns?: any[];
  // 从 Markdown meta 里解析出来的 preview 标记
  // 使用字符串是为了兼容 element.preview === "true" 的判断
  preview?: string;
}

/**
 * 创建一个空段落节点
 */
function createEmptyParagraph(): SlateNode {
  return {
    type: "paragraph",
    children: [{ text: "" }],
  };
}

/**
 * 安全获取 children 数组
 */
function getChildren(node: any): any[] {
  if (!node || typeof node !== "object") return [];
  if (!Array.isArray(node.children)) return [];
  return node.children;
}

/**
 * 从 mdast 的 code 节点中解析 preview meta
 * 支持：
 * ```tsx preview
 * ```tsx preview=true
 */
function getPreviewFlagFromMeta(node: any): "true" | undefined {
  const meta = typeof node?.meta === "string" ? node.meta.trim() : "";
  if (!meta) return undefined;

  const tokens = meta.split(/\s+/);

  const hasPreview = tokens.some((tok) => {
    if (tok === "preview") return true;
    if (tok.startsWith("preview=")) {
      const [, value] = tok.split("=");
      return value === "true";
    }
    return false;
  });

  return hasPreview ? "true" : undefined;
}

/**
 * 将一个 list 节点转换为 Slate list 节点
 */
function convertList(node: any): SlateNode {
  const start = typeof node.start === "number" ? node.start : 1;
  const items = getChildren(node);

  return {
    type: "list",
    ordered: !!node.ordered,
    start,
    children: items.map((item: any, index: number) =>
      convertListItem(item, start + index)
    ),
  };
}

/**
 * 将 listItem 节点转换为 Slate list-item 节点
 */
function convertListItem(item: any, value: number): SlateNode {
  const children = convertListItemChildren(item);

  const listItemNode: SlateNode = {
    type: "list-item",
    value,
    children: children.length ? children : [createEmptyParagraph()],
  };

  if (item && (item.checked === true || item.checked === false)) {
    listItemNode.checked = item.checked;
  }

  return listItemNode;
}

/**
 * 将 listItem 里的子节点统一转换
 * 支持：
 * - 段落
 * - 嵌套列表
 * - 引用
 * - 代码块
 * - 表格
 * - 分割线
 * - HTML
 * - 标题等
 */
function convertListItemChildren(item: any): SlateNode[] {
  const children = getChildren(item);
  if (!children.length) return [createEmptyParagraph()];

  return convertBlockChildren(children);
}

/**
 * 转换一组「块级」节点（用于 root / blockquote / listItem 等容器）
 */
function convertBlockChildren(nodes: any[]): SlateNode[] {
  const result: SlateNode[] = [];

  for (const node of nodes || []) {
    const converted = convertBlockNode(node);
    if (!converted) continue;

    if (Array.isArray(converted)) {
      result.push(...converted);
    } else {
      result.push(converted);
    }
  }

  return result;
}

/**
 * 将单个 mdast「块级」节点转换为 Slate 节点
 * 这里处理所有可以作为块的类型：paragraph / heading / list / blockquote / code / table / html / thematicBreak ...
 */
function convertBlockNode(node: any): SlateNode | SlateNode[] | null {
  if (!node || typeof node !== "object") return null;

  switch (node.type) {
    // 段落
    case "paragraph":
      return {
        type: "paragraph",
        children: node.children?.length
          ? processInlineNodes(node.children)
          : [{ text: "" }],
      };

    // 标题
    case "heading": {
      const depth = (node as any).depth || 1;
      const headings = ["one", "two", "three", "four", "five", "six"];
      const suffix = headings[depth - 1] || "one";
      return {
        type: `heading-${suffix}`,
        children: node.children?.length
          ? processInlineNodes(node.children)
          : [{ text: "" }],
      };
    }

    // 代码块（支持 preview meta）
    case "code":
      return {
        type: "code-block",
        language: node.lang || "text",
        preview: getPreviewFlagFromMeta(node),
        children: (node.value || "").split("\n").map((line: string) => ({
          type: "code-line",
          children: [{ text: line }],
        })),
      };

    // 列表
    case "list":
      return convertList(node);

    // 引用块（blockquote）
    case "blockquote": {
      const children = convertBlockChildren(getChildren(node));
      return {
        type: "quote",
        children: children.length ? children : [createEmptyParagraph()],
      };
    }

    // 表格
    case "table": {
      const tableNode = transformTable(node);
      return tableNode || null;
    }

    // 分割线
    case "thematicBreak":
      return { type: "thematic-break", children: [{ text: "" }] };

    // 原始 HTML（块级）
    case "html": {
      // 原来的实现只处理 position.start.column === 1 的块级 html
      // 这里保持同样逻辑，避免行为改变太大
      const isBlockHtml = !node.position || node.position.start?.column === 1;

      if (!isBlockHtml) return null;

      return {
        type: "html-block",
        html: node.value || "",
        children: [{ text: "" }],
      };
    }

    // root：取 children 继续处理
    case "root":
      return convertBlockChildren(getChildren(node));

    default:
      return null;
  }
}

/**
 * 顶层入口：MDAST -> Slate 数组
 */
export function mdastToSlate(mdastTree: any): SlateNode[] {
  if (!mdastTree) {
    return [createEmptyParagraph()];
  }

  let rootChildren: any[] = [];

  if (mdastTree.type === "root") {
    rootChildren = getChildren(mdastTree);
  } else if (Array.isArray(mdastTree.children)) {
    // 非 root 但有 children 的场景也兼容一下
    rootChildren = mdastTree.children;
  } else {
    // 单节点也走统一转换
    const single = convertBlockNode(mdastTree);
    if (!single) return [createEmptyParagraph()];
    return Array.isArray(single) ? single : [single];
  }

  const slateNodes = convertBlockChildren(rootChildren);

  return slateNodes.length ? slateNodes : [createEmptyParagraph()];
}
