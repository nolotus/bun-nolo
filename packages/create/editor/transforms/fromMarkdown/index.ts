// ========================================================================
// START: 最终修复版的 mdastToSlate.ts
// ========================================================================

import { visit } from "unist-util-visit";
import { processInlineNodes } from "./inline";
import { transformTable } from "./table";

// ... SlateNode 接口和 ensureValidNode 函数保持不变 ...
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
}

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

export function mdastToSlate(mdastTree: any): SlateNode[] {
  if (!mdastTree) {
    return [{ type: "paragraph", children: [{ text: "" }] }];
  }

  const slateNodes: SlateNode[] = [];
  const processedNodes = new Set();

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
            children: (child.value || "")
              .split("\n")
              .map((line: string) => ({
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
        // 这是被最终修复的地方
        // =================================================================
        case "code":
          // 移除了错误的 IF 判断，现在它可以正确处理所有未被处理过的代码块
          slateNodes.push({
            type: "code-block",
            language: node.lang || "text",
            children: node.value.split("\n").map((line) => ({
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

        // ... 其他所有 case 保持不变 ...
        case "blockquote":
          slateNodes.push({
            type: "quote",
            children: processBlockChildren(node.children),
          });
          break;
        case "heading":
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
        case "paragraph":
          if (!parent || parent.type !== "listItem") {
            slateNodes.push({
              type: "paragraph",
              children: processInlineNodes(node.children),
            });
          }
          break;
        case "table":
          const tableNode = transformTable(node);
          if (tableNode) {
            slateNodes.push(tableNode);
          }
          break;
        case "thematicBreak":
          slateNodes.push({ type: "thematic-break", children: [{ text: "" }] });
          break;
        case "html":
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
// END: 最终修复版的 mdastToSlate.ts
// ========================================================================
