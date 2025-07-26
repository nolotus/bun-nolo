/**
 * 这是一个递归的辅助函数，用于将单个 Slate 节点转换为简化版 Markdown。
 * @param node 当前要处理的 Slate 节点。
 * @param listDepth 用于处理嵌套列表的缩进。
 */
function renderNode(node: any, listDepth = 0): string {
  if (!node) return "";
  const indentation = "  ".repeat(listDepth);

  switch (node.type) {
    case "heading-one":
      return `# ${node.children.map((n: any) => renderNode(n, listDepth)).join("")}\n\n`;
    case "heading-two":
      return `## ${node.children.map((n: any) => renderNode(n, listDepth)).join("")}\n\n`;
    case "heading-three":
      return `### ${node.children.map((n: any) => renderNode(n, listDepth)).join("")}\n\n`;
    case "heading-four":
      return `#### ${node.children.map((n: any) => renderNode(n, listDepth)).join("")}\n\n`;
    case "heading-five":
      return `##### ${node.children.map((n: any) => renderNode(n, listDepth)).join("")}\n\n`;
    case "heading-six":
      return `###### ${node.children.map((n: any) => renderNode(n, listDepth)).join("")}\n\n`;

    case "paragraph":
      return `${node.children.map((n: any) => renderNode(n, listDepth)).join("")}\n\n`;

    case "list":
      return node.children
        .map((item: any) => renderNode(item, listDepth + 1))
        .join("");

    case "list-item":
      return `${indentation}- ${node.children.map((n: any) => renderNode(n, listDepth)).join("")}\n`;

    case "quote":
      const content = node.children
        .map((n: any) => renderNode(n, listDepth))
        .join("")
        .trim();
      return `> ${content.replace(/\n/g, "\n> ")}\n\n`;

    case "code-block":
      const code = node.children
        .map((line: any) =>
          (line.children || []).map((text: any) => text.text).join("")
        )
        .join("\n");
      return "```" + (node.language || "") + "\n" + code + "\n```\n\n";

    case "link":
      const linkText = node.children
        .map((n: any) => renderNode(n, listDepth))
        .join("");
      return `[${linkText}](${node.url})`;

    case "table":
      let tableText = "--- Table ---\n";
      const headerRow = node.children[0];
      if (headerRow) {
        tableText +=
          "Headers: " +
          headerRow.children
            .map((cell: any) => `[${renderNode(cell).trim()}]`)
            .join(" | ") +
          "\n";
      }
      node.children.slice(1).forEach((row: any, rowIndex: number) => {
        tableText +=
          `Row ${rowIndex + 1}: ` +
          row.children
            .map((cell: any) => `[${renderNode(cell).trim()}]`)
            .join(" | ") +
          "\n";
      });
      tableText += "--- End Table ---\n\n";
      return tableText;

    case "code-inline":
      return `\`${node.children.map((n: any) => renderNode(n, listDepth)).join("")}\``;

    case "thematic-break":
      return "---\n\n";

    // 默认情况：如果是文本节点，返回值；如果是其他元素（如 table-row, table-cell），则递归处理子节点
    default:
      return (
        node.text ||
        (node.children
          ? node.children
              .map((child: any) => renderNode(child, listDepth))
              .join("")
          : "")
      );
  }
}

/**
 * 将 Slate 节点数组转换为“简化版 Markdown”字符串。
 * 保留了核心结构（标题、列表），但简化了表格并忽略了部分行内格式。
 * @param nodes Slate 节点数组。
 * @returns 简化版的 Markdown 字符串。
 */
export function slateToSimplifiedMarkdown(nodes: any[]): string {
  if (!nodes || nodes.length === 0) {
    return "";
  }
  return (
    nodes
      .map((node) => renderNode(node))
      .join("")
      .trim() + "\n"
  );
}
