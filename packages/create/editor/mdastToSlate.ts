// create/editor/mdastToSlate

import { visit } from "unist-util-visit";
import { processInlineNodes } from "./processInlineNodes";

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
      return {
        type: "quote",
        children: processBlockChildren(node.children),
      };
    }
    return null;
  }

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
          const nestedListItems = child.children.map((nestedItem: any) => {
            if (!ensureValidNode(nestedItem)) {
              return {
                type: "list-item",
                children: [{ text: "" }],
              };
            }

            const nestedItemNode: SlateNode = {
              type: "list-item",
              children: processListItemChildren(nestedItem),
            };

            if (
              nestedItem.checked !== null &&
              nestedItem.checked !== undefined
            ) {
              nestedItemNode.checked = nestedItem.checked;
            }

            return nestedItemNode;
          });

          result.push({
            type: "list",
            ordered: !!child.ordered,
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
            // 将 heading-${depth} 改为对应的英文表达
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
            start: node.start || 1, // 保存起始序号，默认为 1
            children: (node.children || []).map((item: any, index: number) => {
              processedNodes.add(item);
              (item.children || []).forEach((child: any) =>
                processedNodes.add(child)
              );

              const listItemNode: SlateNode = {
                type: "list-item",
                value: (node.start || 1) + index, // 保存每个列表项的序号
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
          slateNodes.push({
            type: "table",
            children: (node.children || []).map(
              (row: any, rowIndex: number) => ({
                type: "table-row",
                children: (row.children || []).map((cell: any) => ({
                  type: "table-cell",
                  ...(rowIndex === 0 ? { header: true } : {}),
                  children: processInlineNodes(cell.children || []),
                })),
              })
            ),
          });
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
