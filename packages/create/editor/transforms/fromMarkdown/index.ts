import { visit } from "unist-util-visit";
import { processInlineNodes } from "./inline";
import { transformTable } from "./table"; // (1) 导入新的、独立的表格转换器

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
  columns?: any[]; // 为表格节点添加 columns 属性
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

  // processBlockChildren 和 processNode 函数保持不变
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
      return {
        type: "quote",
        children: processBlockChildren(node.children),
      };
    }
    return null;
  }

  // processListItemChildren 函数保持不变
  function processListItemChildren(item: any): any[] {
    if (!ensureValidNode(item)) {
      return [{ text: "" }];
    }
    if (item.children.length > 1) {
      const result = [];
      if (item.children[0]?.type === "paragraph") {
        result.push(...processInlineNodes(item.children[0].children));
      }
      for (let i = 1; i < item.children.length; i++) {
        const child = item.children[i];
        if (child?.type === "list") {
          const nestedListItems = child.children.map(
            (nestedItem: any, index: number) => {
              if (!ensureValidNode(nestedItem)) {
                return {
                  type: "list-item",
                  children: [{ text: "" }],
                };
              }
              const nestedItemNode: SlateNode = {
                type: "list-item",
                value: (child.start || 1) + index,
                children: processListItemChildren(nestedItem),
              };
              if (
                nestedItem.checked !== null &&
                nestedItem.checked !== undefined
              ) {
                nestedItemNode.checked = nestedItem.checked;
              }
              return nestedItemNode;
            }
          );
          result.push({
            type: "list",
            ordered: !!child.ordered,
            start: child.start || 1,
            children: nestedListItems,
          });
        }
      }
      return result.length ? result : [{ text: "" }];
    }
    return item.children[0]?.type === "paragraph"
      ? processInlineNodes(item.children[0].children)
      : [{ text: "" }];
  }

  visit(mdastTree, (node, index, parent) => {
    if (!ensureValidNode(node) || processedNodes.has(node)) {
      return;
    }
    try {
      switch (node.type) {
        // ... 其他 case 保持不变 ...
        case "blockquote":
          slateNodes.push({
            type: "quote",
            children: processBlockChildren(node.children),
          });
          break;
        case "code":
          if (!parent || parent.type !== "code") {
            slateNodes.push({
              type: "code-block",
              language: node.lang || "text",
              children: node.value.split("\n").map((line) => ({
                type: "code-line",
                children: [{ text: line }],
              })),
            });
          }
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
        case "list":
          slateNodes.push({
            type: "list",
            ordered: !!node.ordered,
            start: node.start || 1,
            children: (node.children || []).map((item: any, index: number) => {
              processedNodes.add(item);
              (item.children || []).forEach((child: any) =>
                processedNodes.add(child)
              );
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

        case "table":
          // (2) 调用新的表格处理函数
          const tableNode = transformTable(node);

          // (3) 检查返回值，确保只添加有效的节点
          if (tableNode) {
            slateNodes.push(tableNode);
          }

          // (4) 旧的、内联的表格处理逻辑已被移除
          break;

        case "thematicBreak":
          slateNodes.push({
            type: "thematic-break",
            children: [{ text: "" }],
          });
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
