// 路径：create/editor/transforms/table.ts

import { Element as SlateElement } from "slate";
import { processInlineNodes } from "./inline";

// MDAST 类型（简化）
type MdastNode = { [key: string]: any };

type MdastTableCell = {
  type: "tableCell";
  children: MdastNode[];
};

type MdastTableRow = {
  type: "tableRow";
  children: MdastTableCell[];
};

type MdastTable = {
  type: "table";
  align: (string | null)[];
  children: MdastTableRow[];
};

// Slate 表格相关类型
export type SlateTableCell = SlateElement & { header?: boolean };
type SlateTableRow = SlateElement & { children: SlateTableCell[] };
type SlateTableColumn = { align: string; width: null | number };

export type SlateTable = SlateElement & {
  columns: SlateTableColumn[];
  children: SlateTableRow[];
};

/**
 * 创建一个 Slate table-cell 节点。
 * @param mdastCell - 输入的 MDAST tableCell 节点。
 * @param isHeader - 当前单元格是否为表头。
 */
function createSlateCell(
  mdastCell: MdastTableCell,
  isHeader: boolean
): SlateTableCell {
  // 1. 使用行内转换，生成 cell 内的行内子节点
  let inlineChildren = processInlineNodes(mdastCell.children || []);

  // 2. 确保至少有一个 text 节点
  if (inlineChildren.length === 0) {
    inlineChildren = [{ text: "" }];
  }

  // 3. 包裹在一个 paragraph 中（符合 Slate 表格 schema）
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
 */
export function transformTable(node: MdastTable): SlateTable | null {
  if (node.type !== "table" || !node.children || node.children.length === 0) {
    return null;
  }

  // 计算表格的最大列数
  const maxColumns = node.children.reduce(
    (max, row) => Math.max(max, row.children?.length || 0),
    0
  );

  if (maxColumns === 0) return null;

  // 将列数不足的行用空单元格补齐，保证每行列数一致
  const normalizedRows: MdastTableRow[] = node.children.map((row) => {
    const cells = row.children || [];
    const diff = maxColumns - cells.length;

    if (diff > 0) {
      // 使用 Array.from 避免 fill 带来的同一引用问题
      const emptyCells: MdastTableCell[] = Array.from({ length: diff }, () => ({
        type: "tableCell",
        children: [],
      }));
      return { ...row, children: [...cells, ...emptyCells] };
    }

    return row;
  });

  // 处理列的对齐信息
  const align = node.align || [];
  const columns: SlateTableColumn[] = Array.from(
    { length: maxColumns },
    (_, i) => ({
      align: align[i] || "left",
      width: null,
    })
  );

  // 行 & 单元格转换
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
