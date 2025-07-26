import React, { useEffect, useRef, useState } from "react";
import { useSlate, ReactEditor } from "slate-react";
import { Editor } from "slate";
import {
  isSelectionInTable,
  insertRow,
  insertColumn,
  deleteRow,
  deleteColumn,
  deleteTable,
} from "./tableCommands";
import { Button } from "./components";
import {
  LuArrowUpFromLine,
  LuArrowDownFromLine,
  LuArrowLeftFromLine,
  LuArrowRightFromLine,
  LuTrash2,
  LuColumns3,
  LuRows3,
} from "react-icons/lu";
import { createPortal } from "react-dom";

export const TableContextMenu: React.FC = () => {
  const editor = useSlate();
  const menuRef = useRef<HTMLDivElement>(null);
  // isVisible state 现在只控制 pointerEvents，视觉效果由 opacity 直接控制
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = menuRef.current;
    if (!el) return;

    const { selection } = editor;
    const shouldBeVisible =
      selection && ReactEditor.isFocused(editor) && isSelectionInTable(editor);

    if (shouldBeVisible) {
      const [table] = Editor.nodes(editor, {
        match: (n) => n.type === "table",
      });
      if (table) {
        const tableDomNode = ReactEditor.toDOMNode(editor, table[0]);
        const { top, left, width } = tableDomNode.getBoundingClientRect();

        el.style.opacity = "1";
        el.style.top = `${top + window.scrollY}px`;
        el.style.left = `${left + window.scrollX + width + 12}px`;
        setIsVisible(true);
      }
    } else {
      // 核心修正: 当菜单不应显示时，主动将其透明度设为0
      el.style.opacity = "0";
      setIsVisible(false);
    }
  }, [editor, editor.selection]);

  const buttonGroupStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-1)",
  };

  const menu = (
    <div
      ref={menuRef}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        position: "absolute",
        zIndex: 20,
        backgroundColor: "var(--background)",
        borderRadius: "var(--space-2)",
        boxShadow: "0 4px 12px var(--shadowHeavy)",
        padding: "var(--space-2)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
        opacity: 0, // 初始透明度为0
        transition: "opacity 0.15s ease-in-out",
        // isVisible state 控制是否可以被点击
        pointerEvents: isVisible ? "all" : "none",
      }}
    >
      <div style={buttonGroupStyle}>
        <Button onClick={() => insertRow(editor, "above")}>
          <LuArrowUpFromLine
            size={16}
            style={{ marginRight: "var(--space-2)" }}
          />{" "}
          插入上方行
        </Button>
        <Button onClick={() => insertRow(editor, "below")}>
          <LuArrowDownFromLine
            size={16}
            style={{ marginRight: "var(--space-2)" }}
          />{" "}
          插入下方行
        </Button>
      </div>
      <div style={buttonGroupStyle}>
        <Button onClick={() => insertColumn(editor, "left")}>
          <LuArrowLeftFromLine
            size={16}
            style={{ marginRight: "var(--space-2)" }}
          />{" "}
          插入左侧列
        </Button>
        <Button onClick={() => insertColumn(editor, "right")}>
          <LuArrowRightFromLine
            size={16}
            style={{ marginRight: "var(--space-2)" }}
          />{" "}
          插入右侧列
        </Button>
      </div>
      <div
        style={{
          borderTop: "1px solid var(--border)",
          margin: "var(--space-1) 0",
        }}
      />
      <div style={buttonGroupStyle}>
        <Button onClick={() => deleteRow(editor)}>
          <LuRows3 size={16} style={{ marginRight: "var(--space-2)" }} /> 删除行
        </Button>
        <Button onClick={() => deleteColumn(editor)}>
          <LuColumns3 size={16} style={{ marginRight: "var(--space-2)" }} />{" "}
          删除列
        </Button>
        <Button onClick={() => deleteTable(editor)}>
          <LuTrash2 size={16} style={{ marginRight: "var(--space-2)" }} />{" "}
          删除表格
        </Button>
      </div>
    </div>
  );

  return createPortal(menu, document.body);
};
