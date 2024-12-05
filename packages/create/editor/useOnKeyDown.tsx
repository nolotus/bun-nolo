import React, { useCallback, useState } from "react";
import { Editor } from "slate";

export const useOnKeydown = (editor) => {
  const onKeyDown = useCallback(
    (e) => {
      if (e.key === "Tab") {
        // 直接判断key属性
        e.preventDefault();
        Editor.insertText(editor, "  ");
      }
    },
    [editor],
  );
  return onKeyDown;
};
