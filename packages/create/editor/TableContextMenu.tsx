// create/editor/TableContextMenu.tsx (使用 @floating-ui/react 最终修复版)

import React, { useEffect, useRef, useState } from "react";
import { useSlate, ReactEditor } from "slate-react";
import { Editor } from "slate";
import { createPortal } from "react-dom";

// 1. 导入 @floating-ui/react 的核心库
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
} from "@floating-ui/react";

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

export const TableContextMenu: React.FC = () => {
  const editor = useSlate();

  // 2. 设置 useFloating hook
  const { x, y, refs, strategy, context } = useFloating({
    // 当元素挂载时，自动更新位置 (处理滚动、缩放等所有情况)
    whileElementsMounted: autoUpdate,
    // 初始首选位置
    placement: "right-start",
    // 中间件，按顺序执行
    middleware: [
      offset(12), // 偏移量，菜单离表格12px
      flip(), // 空间不足时，自动翻转到对侧 (e.g., right -> left)
      shift(), // 确保菜单始终在视口内，不会被裁切
    ],
  });

  // 用于控制菜单是否应该“存在”
  const [show, setShow] = useState(false);

  // 3. 重写 useEffect 逻辑，现在它只负责一件事：
  // 判断是否应该显示菜单，并设置浮动UI的引用元素(reference)
  useEffect(() => {
    const { selection } = editor;
    const shouldShow =
      selection && ReactEditor.isFocused(editor) && isSelectionInTable(editor);

    setShow(shouldShow);

    if (shouldShow) {
      const [table] = Editor.nodes(editor, {
        match: (n) => n.type === "table",
      });
      if (table) {
        // 将表格的 DOM 节点设置为浮动UI的“引用”
        const tableDomNode = ReactEditor.toDOMNode(editor, table[0]);
        refs.setReference(tableDomNode);
      }
    }
  }, [editor, editor.selection, refs]);

  const buttonGroupStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "var(--space-1)",
  };

  // 4. 将浮动UI的 props 应用到菜单元素上
  const menu = show ? (
    <div
      ref={refs.setFloating} // 设置“浮动”元素
      onMouseDown={(e) => e.preventDefault()}
      style={{
        // 由 useFloating hook 提供的位置和策略
        position: strategy,
        top: y ?? 0,
        left: x ?? 0,

        // 其他样式
        zIndex: 20,
        backgroundColor: "var(--background)",
        borderRadius: "var(--space-2)",
        boxShadow: "0 4px 12px var(--shadowHeavy)",
        padding: "var(--space-2)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
        transition: "opacity 0.15s ease-in-out",
      }}
    >
      {/* 菜单内部按钮保持不变 */}
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
  ) : null;

  return createPortal(menu, document.body);
};
