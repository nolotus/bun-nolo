import React, { useCallback, useRef } from "react";
import { useSlateStatic, ReactEditor } from "slate-react";
import { Editor, Path } from "slate";
import { setColumnWidth } from "./tableCommands";

interface ColumnResizerProps {
  columnIndex: number;
  tablePath: Path;
}

export const ColumnResizer: React.FC<ColumnResizerProps> = ({
  columnIndex,
  tablePath,
}) => {
  const editor = useSlateStatic();
  const handleRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      event.preventDefault();
      const delta = event.clientX - startX.current;
      const newWidth = startWidth.current + delta;
      // console.log(`[Resizer] Mouse Move: newWidth = ${newWidth}`);
      setColumnWidth(editor, tablePath, columnIndex, newWidth);
    },
    [editor, tablePath, columnIndex]
  );

  const handleMouseUp = useCallback(() => {
    // console.log('[Resizer] Mouse Up: Removing listeners.');
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  }, [handleMouseMove]);

  const handleMouseDown = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      // console.log(`[Resizer] Mouse Down on column ${columnIndex}`);

      const tableNodeEntry = Editor.node(editor, tablePath);
      if (!tableNodeEntry) {
        // console.error('[Resizer] Could not find table node at path:', tablePath);
        return;
      }

      const tableElement = ReactEditor.toDOMNode(editor, tableNodeEntry[0]);

      // --- vvvv 核心修正 vvvv ---
      // 旧的、不可靠的查询方式:
      // const cellElement = tableElement.querySelector(`tr:first-child > *:nth-child(${columnIndex + 1})`);

      // 新的、更健壮的查询方式，它能兼容 <thead> 和 <tbody>
      const cellElement = tableElement.querySelector(
        `tr > *:nth-child(${columnIndex + 1})`
      );
      // --- ^^^^ 修正结束 ^^^^ ---

      if (!cellElement) {
        console.error(
          "[Resizer] (修正后) 仍然找不到单元格的DOM元素. 表格的DOM结构可能很特殊。"
        ); // 留下这个以防万一
        return;
      }

      startX.current = event.clientX;
      startWidth.current = cellElement.getBoundingClientRect().width;
      // console.log(`[Resizer] Initial state: startX=${startX.current}, startWidth=${startWidth.current}`);

      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [editor, tablePath, columnIndex, handleMouseMove, handleMouseUp]
  );

  return (
    <div
      ref={handleRef}
      onMouseDown={handleMouseDown}
      className="column-resizer-handle"
      style={{
        position: "absolute",
        top: 0,
        right: -2,
        width: "4px",
        height: "100%",
        cursor: "col-resize",
        zIndex: 10,
      }}
    />
  );
};
