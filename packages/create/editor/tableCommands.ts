import { Editor, Transforms, Element as SlateElement, Path } from "slate";
import { ReactEditor } from "slate-react";

type CustomEditor = ReactEditor & {
  nodeToDecorations?: Map<SlateElement, Range[]>;
};

// ... (isSelectionInTable, getCurrentTable, createTableCell, insertRow, insertColumn, deleteRow, deleteColumn, deleteTable 函数保持不变)

// --- Helper Functions ---
export const isSelectionInTable = (editor: CustomEditor): boolean => {
  const [table] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "table",
  });
  return !!table;
};

const getCurrentTable = (
  editor: CustomEditor
): [SlateElement, Path] | undefined => {
  const [table] = Editor.nodes(editor, {
    match: (n) =>
      !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === "table",
  });
  return table ? (table as [SlateElement, Path]) : undefined;
};

const createTableCell = (): SlateElement => ({
  type: "table-cell",
  children: [{ type: "paragraph", children: [{ text: "" }] }],
});

// --- Command Functions ---
export const insertRow = (
  editor: CustomEditor,
  direction: "above" | "below"
) => {
  const [rowEntry] = Editor.nodes(editor, {
    match: (n) => n.type === "table-row",
  });
  const [tableEntry] = Editor.nodes(editor, {
    match: (n) => n.type === "table",
  });
  if (rowEntry && tableEntry) {
    const [rowNode, rowPath] = rowEntry;
    const [tableNode] = tableEntry;
    const columns = (tableNode.children[0] as SlateElement).children.length;
    const newRow: SlateElement = {
      type: "table-row",
      children: Array.from({ length: columns }, createTableCell),
    };
    const insertPath = direction === "below" ? Path.next(rowPath) : rowPath;
    Transforms.insertNodes(editor, newRow, { at: insertPath });
  }
};

export const insertColumn = (
  editor: CustomEditor,
  direction: "left" | "right"
) => {
  const [cellEntry] = Editor.nodes(editor, {
    match: (n) => n.type === "table-cell",
  });
  const table = getCurrentTable(editor);
  if (cellEntry && table) {
    const [, cellPath] = cellEntry;
    const [tableNode, tablePath] = table;
    const colIndex = cellPath[cellPath.length - 1];
    for (let i = 0; i < tableNode.children.length; i++) {
      const rowPath = [...tablePath, i];
      const insertPath = [
        ...rowPath,
        direction === "right" ? colIndex + 1 : colIndex,
      ];
      Transforms.insertNodes(editor, createTableCell(), { at: insertPath });
    }
  }
};

export const deleteRow = (editor: CustomEditor) => {
  const [rowEntry] = Editor.nodes(editor, {
    match: (n) => n.type === "table-row",
  });
  if (rowEntry) {
    const table = getCurrentTable(editor);
    if (table && table[0].children.length <= 1) deleteTable(editor);
    else Transforms.removeNodes(editor, { at: rowEntry[1] });
  }
};

export const deleteColumn = (editor: CustomEditor) => {
  const [cellEntry] = Editor.nodes(editor, {
    match: (n) => n.type === "table-cell",
  });
  if (cellEntry) {
    const [, cellPath] = cellEntry;
    const table = getCurrentTable(editor);
    const colIndex = cellPath[cellPath.length - 1];
    if (table) {
      const [tableNode, tablePath] = table;
      if ((tableNode.children[0] as SlateElement).children.length <= 1)
        deleteTable(editor);
      else
        for (let i = 0; i < tableNode.children.length; i++)
          Transforms.removeNodes(editor, { at: [...tablePath, i, colIndex] });
    }
  }
};

export const deleteTable = (editor: CustomEditor) => {
  const table = getCurrentTable(editor);
  if (table) Transforms.removeNodes(editor, { at: table[1] });
};

// --- vvvv 新增导航逻辑 vvvv ---

/**
 * 获取表格中所有单元格的节点入口
 */
const getAllCellsInTable = (editor: CustomEditor): [SlateElement, Path][] => {
  const table = getCurrentTable(editor);
  if (!table) return [];
  const [, tablePath] = table;
  return Array.from(
    Editor.nodes(editor, {
      at: tablePath,
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n.type === "table-cell",
    })
  ) as [SlateElement, Path][];
};

/**
 * 移动到下一个单元格。如果在最后一个单元格，则创建新行。
 */
export const moveToNextCell = (editor: CustomEditor) => {
  const [currentCell] = Editor.nodes(editor, {
    match: (n) => n.type === "table-cell",
  });
  if (!currentCell) return;

  const allCells = getAllCellsInTable(editor);
  const currentIndex = allCells.findIndex((c) =>
    Path.equals(c[1], currentCell[1])
  );

  if (currentIndex < allCells.length - 1) {
    // 移动到下一个单元格
    const nextCellPath = allCells[currentIndex + 1][1];
    Transforms.select(editor, Editor.start(editor, nextCellPath));
  } else {
    // 在表格末尾，插入新行并移动到新行的第一个单元格
    insertRow(editor, "below");
    const newAllCells = getAllCellsInTable(editor);
    if (newAllCells.length > allCells.length) {
      const nextCellPath = newAllCells[currentIndex + 1][1];
      Transforms.select(editor, Editor.start(editor, nextCellPath));
    }
  }
};

/**
 * 移动到上一个单元格。
 */
export const moveToPreviousCell = (editor: CustomEditor) => {
  const [currentCell] = Editor.nodes(editor, {
    match: (n) => n.type === "table-cell",
  });
  if (!currentCell) return;

  const allCells = getAllCellsInTable(editor);
  const currentIndex = allCells.findIndex((c) =>
    Path.equals(c[1], currentCell[1])
  );

  if (currentIndex > 0) {
    const prevCellPath = allCells[currentIndex - 1][1];
    Transforms.select(editor, Editor.start(editor, prevCellPath));
  }
};
// --- ^^^^ 新增导航逻辑结束 ^^^^ ---
