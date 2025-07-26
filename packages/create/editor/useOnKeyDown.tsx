import React, { useCallback } from "react";
import { Editor } from "slate";
import { toggleMark } from "./mark";

// 新增：从我们的命令文件中导入表格相关函数
import {
  isSelectionInTable,
  moveToNextCell,
  moveToPreviousCell,
} from "./tableCommands";

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
};

// 您的 isHotkey 函数保持不变
const isHotkey = (hotkey, event) => {
  const [modifier, key] = hotkey.split("+");
  const isMod = modifier === "mod" && (event.metaKey || event.ctrlKey);
  return isMod && event.key.toLowerCase() === key;
};

export const useOnKeyDown = (editor) => {
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // --- 新增逻辑：表格导航优先处理 ---
      // 首先检查光标是否在表格内
      if (isSelectionInTable(editor)) {
        // 如果是 Tab 键
        if (e.key === "Tab") {
          // 阻止默认行为（如跳到下一个输入框）
          e.preventDefault();
          // 根据是否按下 Shift 键来决定是向前还是向后移动
          if (e.shiftKey) {
            moveToPreviousCell(editor);
          } else {
            moveToNextCell(editor);
          }
          // 事件已处理完毕，直接返回，不再执行后续代码
          return;
        }
      }
      // --- 表格逻辑结束 ---

      // 您原有的格式化快捷键逻辑，保持不变
      for (const hotkey in HOTKEYS) {
        if (isHotkey(hotkey, e)) {
          e.preventDefault();
          const mark = HOTKEYS[hotkey];
          toggleMark(editor, mark);
        }
      }

      // 您原有的 Tab 键插入空格的逻辑
      // 只有在光标不在表格内时，这段代码才会被执行
      if (e.key === "Tab") {
        e.preventDefault();
        Editor.insertText(editor, "  ");
      }
    },
    [editor]
  );

  return onKeyDown;
};
