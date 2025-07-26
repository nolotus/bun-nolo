import React, { useCallback } from "react";
import { Editor, Transforms, Range } from "slate";
import { toggleMark } from "./mark"; // 确保文件名是 marks.ts

// 1. 从我们的命令文件中导入所有需要的函数
import {
  isSelectionInTable,
  moveToNextCell,
  moveToPreviousCell,
  moveToUpperCell,
  moveToLowerCell,
  moveToLeftCell,
  moveToRightCell,
} from "./tableCommands";

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
};

// 假设您的 isHotkey 函数已正确实现
const isHotkey = (hotkey: string, event: React.KeyboardEvent): boolean => {
  // 这是一个更健壮的实现
  const hotkeyParts = hotkey.split("+");
  const key = hotkeyParts.pop();
  const isMod = hotkeyParts.includes("mod") && (event.metaKey || event.ctrlKey);
  const isShift = hotkeyParts.includes("shift") && event.shiftKey;

  // 简化的示例，仅支持 mod
  return isMod && event.key.toLowerCase() === key;
};

export const useOnKeyDown = (editor) => {
  return useCallback(
    (e: React.KeyboardEvent) => {
      // --- 表格导航逻辑优先处理 ---
      if (isSelectionInTable(editor)) {
        // --- Tab 键导航 ---
        if (e.key === "Tab") {
          e.preventDefault();
          e.shiftKey ? moveToPreviousCell(editor) : moveToNextCell(editor);
          return;
        }

        // --- 2. 方向键导航 ---
        const { selection } = editor;
        // 只在光标折叠（没有选中文本）时触发
        if (selection && Range.isCollapsed(selection)) {
          const [cell, cellPath] = Editor.nodes(editor, {
            match: (n) => n.type === "table-cell",
            at: selection,
          });

          if (cell) {
            const atStart = Editor.isStart(editor, selection.anchor, cellPath);
            const atEnd = Editor.isEnd(editor, selection.anchor, cellPath);

            switch (e.key) {
              case "ArrowUp":
                if (atStart) {
                  e.preventDefault();
                  moveToUpperCell(editor);
                }
                return;
              case "ArrowDown":
                if (atEnd) {
                  e.preventDefault();
                  moveToLowerCell(editor);
                }
                return;
              case "ArrowLeft":
                if (atStart) {
                  e.preventDefault();
                  moveToLeftCell(editor);
                }
                return;
              case "ArrowRight":
                if (atEnd) {
                  e.preventDefault();
                  moveToRightCell(editor);
                }
                return;
            }
          }
        }
      }
      // --- 表格逻辑结束 ---

      // 格式化快捷键逻辑
      for (const hotkey in HOTKEYS) {
        if (isHotkey(hotkey, e)) {
          e.preventDefault();
          toggleMark(editor, HOTKEYS[hotkey]);
          return; // 添加 return 避免冲突
        }
      }

      // 注意：Tab 键的插入空格逻辑已被表格内的 Tab 逻辑覆盖
      // 如果需要在非表格环境下插入Tab，这里的逻辑是正确的
      if (e.key === "Tab" && !isSelectionInTable(editor)) {
        e.preventDefault();
        Editor.insertText(editor, "  ");
      }
    },
    [editor]
  );
};
