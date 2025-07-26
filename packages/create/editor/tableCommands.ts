import { Editor, Transforms, Element as SlateElement, Path } from "slate";
import { ReactEditor } from "slate-react";

type CustomEditor = ReactEditor & {
  nodeToDecorations?: Map<SlateElement, Range[]>;
};

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

const getAllCellsInTable = (editor: CustomEditor): [SlateElement, Path][] => {
  const table = getCurrentTable(editor);
  if (!table) return [];
  const [, tablePath] = table;
  return Array.from(
    Editor.nodes(editor, {
      at: tablePath,
      match: (n) => n.type === "table-cell",
    })
  ) as [SlateElement, Path][];
};

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
    const nextCellPath = allCells[currentIndex + 1][1];
    Transforms.select(editor, Editor.start(editor, nextCellPath));
  } else {
    insertRow(editor, "below");
    // After inserting, we need to find the new cell path
    const [row] = Editor.above(editor, {
      match: (n) => n.type === "table-row",
    });
    if (row) {
      const nextRowPath = Path.next(row[1]);
      Transforms.select(editor, Editor.start(editor, nextRowPath));
    }
  }
};

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

export const setColumnWidth = (
  editor: CustomEditor,
  tablePath: Path,
  columnIndex: number,
  newWidth: number
) => {
  const tableNode = Editor.node(editor, tablePath)[0] as SlateElement;
  if (!tableNode || tableNode.type !== "table" || !tableNode.columns) {
    return;
  }
  // 使用 structuredClone 替代 JSON.parse(JSON.stringify(...))，更现代、性能更好
  const newColumns = structuredClone(tableNode.columns);

  if (newColumns[columnIndex]) {
    // 确保宽度不小于一个最小值，比如40px
    newColumns[columnIndex].width = Math.max(newWidth, 40);
  } else {
    return;
  }
  Transforms.setNodes(editor, { columns: newColumns }, { at: tablePath });
};

// --- vvvv 方向键导航逻辑 (新增) vvvv ---

/**
 * 内部辅助函数，处理向相邻单元格移动的核心逻辑
 * @param editor 编辑器实例
 * @param direction 移动方向: 'up', 'down', 'left', 'right'
 */
const moveToAdjacentCell = (
  editor: CustomEditor,
  direction: "up" | "down" | "left" | "right"
) => {
  const { selection } = editor;
  if (!selection) return;

  const [cell, cellPath] = Editor.nodes(editor, {
    match: (n) => n.type === "table-cell",
    at: selection,
  });

  if (!cell || !cellPath) return;

  const [table, tablePath] = Editor.above(editor, {
    match: (n) => n.type === "table",
  });
  const [row, rowPath] = Editor.above(editor, {
    match: (n) => n.type === "table-row",
  });

  // @ts-ignore
  if (
    !rowPath ||
    !tablePath ||
    !table ||
    !row ||
    !table.children ||
    !row.children
  )
    return;

  const rowIndex = rowPath[rowPath.length - 1];
  const colIndex = cellPath[cellPath.length - 1];

  let targetPath: Path | undefined;

  switch (direction) {
    case "up":
      if (rowIndex > 0) {
        targetPath = [...tablePath, rowIndex - 1, colIndex];
      }
      break;
    case "down":
      // @ts-ignore
      if (rowIndex < table.children.length - 1) {
        targetPath = [...tablePath, rowIndex + 1, colIndex];
      }
      break;
    case "left":
      if (colIndex > 0) {
        targetPath = [...rowPath, colIndex - 1];
      }
      break;
    case "right":
      // @ts-ignore
      if (colIndex < row.children.length - 1) {
        targetPath = [...rowPath, colIndex + 1];
      }
      break;
  }

  if (targetPath && Editor.hasPath(editor, targetPath)) {
    // 移动光标到目标单元格的开头
    Transforms.select(editor, Editor.start(editor, targetPath));
  }
};

export const moveToUpperCell = (editor: CustomEditor) =>
  moveToAdjacentCell(editor, "up");
export const moveToLowerCell = (editor: CustomEditor) =>
  moveToAdjacentCell(editor, "down");
export const moveToLeftCell = (editor: CustomEditor) =>
  moveToAdjacentCell(editor, "left");
export const moveToRightCell = (editor: CustomEditor) =>
  moveToAdjacentCell(editor, "right");

// --- ^^^^ 方向键导航逻辑 (结束) ^^^^ ---
