// ========================================================================
// START: 最终修复版的 mdastToSlate.ts（已加入 preview 支持 & 语法修正）
// ========================================================================

import { visit } from "unist-util-visit";
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
  // 新增：从 Markdown meta 里解析出来的 preview 标记
  // 使用字符串是为了兼容 CodeBlock 里 element.preview === "true" 的判断
  preview?: string;
}

/**
 * 基础校验，保证 node 至少有 type 和 children 数组
 */
function ensureValidNode(node: any): boolean {
  if (!node || typeof node !== "object") return false;
  if (!node.type) return false;
  if (!Array.isArray(node.children)) {
    node.children = [{ text: "" }];
  }
  if (node.children.length === 0) {
    node.children = [{ text: "" }];
  }
  return true;
}

/**
 * 从 mdast 的 code 节点中解析 preview meta
 * 支持：
 * ```tsx preview
 * ```tsx preview=true
 */
function getPreviewFlagFromMeta(node: any): "true" | undefined {
  const meta = typeof node.meta === "string" ? node.meta.trim() : "";
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

export function mdastToSlate(mdastTree: any): SlateNode[] {
  if (!mdastTree) {
    return [{ type: "paragraph", children: [{ text: "" }] }];
  }

  const slateNodes: SlateNode[] = [];
  const processedNodes = new Set<any>();

  function processBlockChildren(children: any[]): any[] {
    if (!Array.isArray(children)) return [{ text: "" }];
    return children.map((child) => {
      if (!ensureValidNode(child)) {
        return { text: "" };
      }
      processedNodes.add(child);
      if (child.type === "paragraph") {
        return {
          type: "paragraph",
          children: processInlineNodes(child.children),
        };
      }
      if (child.type === "blockquote") {
        return {
          type: "quote",
          children: processBlockChildren(child.children),
        };
      }
      return processNode(child) || { text: "" };
    });
  }

  function processNode(node: any): SlateNode | null {
    if (!ensureValidNode(node) || processedNodes.has(node)) {
      return null;
    }
    if (node.type === "blockquote") {
      processedNodes.add(node);
      return { type: "quote", children: processBlockChildren(node.children) };
    }
    return null;
  }

  function processListItemChildren(item: any): any[] {
    if (!ensureValidNode(item) || !Array.isArray(item.children)) {
      return [{ type: "paragraph", children: [{ text: "" }] }];
    }
    const result: SlateNode[] = [];
    item.children.forEach((child: any) => {
      if (!ensureValidNode(child)) {
        return;
      }
      switch (child.type) {
        case "paragraph":
          result.push({
            type: "paragraph",
            children: processInlineNodes(child.children),
          });
          break;

        case "code":
          result.push({
            type: "code-block",
            language: child.lang || "text",
            // 在列表里的代码块，同样从 meta 里解析 preview
            preview: getPreviewFlagFromMeta(child),
            children: (child.value || "").split("\n").map((line: string) => ({
              type: "code-line",
              children: [{ text: line }],
            })),
          });
          processedNodes.add(child);
          break;

        case "list":
          result.push({
            type: "list",
            ordered: !!child.ordered,
            start: child.start || 1,
            children: (child.children || []).map(
              (nestedItem: any, index: number) => {
                processedNodes.add(nestedItem);
                const listItemNode: SlateNode = {
                  type: "list-item",
                  value: (child.start || 1) + index,
                  children: processListItemChildren(nestedItem),
                };
                if (
                  nestedItem.checked !== null &&
                  nestedItem.checked !== undefined
                ) {
                  listItemNode.checked = nestedItem.checked;
                }
                return listItemNode;
              }
            ),
          });
          processedNodes.add(child);
          break;

        default:
          break;
      }
    });
    return result.length > 0
      ? result
      : [{ type: "paragraph", children: [{ text: "" }] }];
  }

  visit(mdastTree, (node, index, parent) => {
    if (!ensureValidNode(node) || processedNodes.has(node)) {
      return;
    }
    try {
      switch (node.type) {
        // =================================================================
        // 代码块：最终修复版 + preview 支持
        // =================================================================
        case "code":
          slateNodes.push({
            type: "code-block",
            language: node.lang || "text",
            // 顶层代码块，从 meta 里解析 preview
            preview: getPreviewFlagFromMeta(node),
            children: (node.value || "").split("\n").map((line: string) => ({
              type: "code-line",
              children: [{ text: line }],
            })),
          });
          break;
        // =================================================================

        case "list":
          slateNodes.push({
            type: "list",
            ordered: !!node.ordered,
            start: node.start || 1,
            children: (node.children || []).map((item: any, index: number) => {
              processedNodes.add(item);
              const listItemNode: SlateNode = {
                type: "list-item",
                value: (node.start || 1) + index,
                children: processListItemChildren(item),
              };
              if (item.checked !== null && item.checked !== undefined) {
                listItemNode.checked = item.checked;
              }
              return listItemNode;
            }),
          });
          break;

        case "blockquote":
          slateNodes.push({
            type: "quote",
            children: processBlockChildren(node.children),
          });
          break;

        case "heading": {
          function getHeadingText(depth: number): string {
            const headings = ["one", "two", "three", "four", "five", "six"];
            return headings[depth - 1] || "one";
          }
          slateNodes.push({
            type: `heading-${getHeadingText((node as any).depth || 1)}`,
            children: node.children.length
              ? processInlineNodes(node.children)
              : [{ text: "" }],
          });
          break;
        }

        case "paragraph":
          // 列表项里的 paragraph 在 processListItemChildren 里处理，这里只处理非 listItem 父级
          if (!parent || parent.type !== "listItem") {
            slateNodes.push({
              type: "paragraph",
              children: processInlineNodes(node.children),
            });
          }
          break;

        case "table": {
          const tableNode = transformTable(node);
          if (tableNode) {
            slateNodes.push(tableNode);
          }
          break;
        }

        case "thematicBreak":
          slateNodes.push({ type: "thematic-break", children: [{ text: "" }] });
          break;

        case "html":
          // 只处理块级 html（从第一列开始）
          if (node.position?.start.column === 1) {
            slateNodes.push({
              type: "html-block",
              html: node.value || "",
              children: [{ text: "" }],
            });
          }
          break;
      }
    } catch (error) {
      console.warn("Error processing node:", error);
    }
    processedNodes.add(node);
  });

  return slateNodes.length
    ? slateNodes
    : [{ type: "paragraph", children: [{ text: "" }] }];
}

// ========================================================================
// END: 最终修复版的 mdastToSlate.ts（已加入 preview 支持 & 语法修正）
// ========================================================================
