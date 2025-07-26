import { Element as SlateElement } from "slate";
import { processInlineNodes } from "./inline";

// 类型定义保持不变
type MdastNode = { [key: string]: any };
type MdastTableCell = { type: "tableCell"; children: MdastNode[] };
type MdastTableRow = { type: "tableRow"; children: MdastTableCell[] };
type MdastTable = {
  type: "table";
  align: (string | null)[];
  children: MdastTableRow[];
};

export type SlateTableCell = SlateElement & { header?: boolean };
type SlateTableRow = SlateElement & { children: SlateTableCell[] };
type SlateTableColumn = { align: string; width: null | number };
export type SlateTable = SlateElement & {
  columns: SlateTableColumn[];
  children: SlateTableRow[];
};

/**
 * 创建一个 Slate table-cell 节点。
 * --- 这是我们修正的核心 ---
 * @param mdastCell - 输入的 MDAST tableCell 节点。
 * @param isHeader - 当前单元格是否为表头。
 * @returns 一个符合 Slate 规范的 table-cell 节点。
 */
function createSlateCell(
  mdastCell: MdastTableCell,
  isHeader: boolean
): SlateTableCell {
  // 1. 正常处理 mdast 的行内节点，得到 slate 的行内节点数组
  let inlineChildren = processInlineNodes(mdastCell.children || []);

  // 2. 如果处理后结果为空，确保至少有一个空的 text node，这是 Slate 的要求
  if (inlineChildren.length === 0) {
    inlineChildren = [{ text: "" }];
  }

  // 3. 将所有行内节点包裹在一个 paragraph 中
  const slateCellChildren = [
    {
      type: "paragraph",
      children: inlineChildren,
    },
  ];

  const slateCell: SlateTableCell = {
    type: "table-cell",
    children: slateCellChildren,
  };

  if (isHeader) {
    slateCell.header = true;
  }

  return slateCell;
}

/**
 * 将 MDAST 表格节点转换为 Slate 表格节点。
 * (这部分逻辑是正确的，无需改动)
 * @param node - 输入的 MDAST table 节点。
 * @returns 一个符合 Slate 规范的 table 节点，或在无效输入时返回 null。
 */
export function transformTable(node: MdastTable): SlateTable | null {
  if (node.type !== "table" || !node.children || node.children.length === 0) {
    return null;
  }

  const maxColumns = node.children.reduce(
    (max, row) => Math.max(max, row.children?.length || 0),
    0
  );

  if (maxColumns === 0) return null;

  const normalizedRows = node.children.map((row) => {
    const cells = row.children || [];
    const diff = maxColumns - cells.length;
    if (diff > 0) {
      const emptyCells: MdastTableCell[] = Array(diff).fill({
        type: "tableCell",
        children: [],
      });
      return { ...row, children: [...cells, ...emptyCells] };
    }
    return row;
  });

  const align = node.align || [];
  const columns: SlateTableColumn[] = Array.from(
    { length: maxColumns },
    (_, i) => ({
      align: align[i] || "left",
      width: null,
    })
  );

  const slateRows: SlateTableRow[] = normalizedRows.map((row, rowIndex) => {
    const isHeaderRow = rowIndex === 0;
    return {
      type: "table-row",
      children: row.children.map((cell) => createSlateCell(cell, isHeaderRow)),
    };
  });

  return {
    type: "table",
    columns,
    children: slateRows,
  };
}
