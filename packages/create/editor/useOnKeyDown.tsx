import React, { useCallback } from "react";
import { Editor } from "slate";
import { toggleMark } from "./mark";

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
};

// 简单的热键判断实现
const isHotkey = (hotkey, event) => {
  const [modifier, key] = hotkey.split("+");
  const isMod = modifier === "mod" && (event.metaKey || event.ctrlKey);
  return isMod && event.key.toLowerCase() === key;
};

export const useOnKeydown = (editor) => {
  const onKeyDown = useCallback(
    (e) => {
      for (const hotkey in HOTKEYS) {
        if (isHotkey(hotkey, e)) {
          e.preventDefault();
          const mark = HOTKEYS[hotkey];
          toggleMark(editor, mark);
        }
      }

      if (e.key === "Tab") {
        e.preventDefault();
        Editor.insertText(editor, "  ");
      }
    },
    [editor],
  );

  return onKeyDown;
};
