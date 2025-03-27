import { useEffect, RefObject } from "react";

interface KeyboardSaveProps {
  isReadOnly: boolean;
  editorFocusedRef: RefObject<boolean>;
  saveTimeoutRef: RefObject<ReturnType<typeof setTimeout> | null>;
  onSave: () => void;
}

/**
 * 处理键盘保存快捷键的自定义Hook
 */
const useKeyboardSave = ({
  isReadOnly,
  editorFocusedRef,
  saveTimeoutRef,
  onSave,
}: KeyboardSaveProps): void => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 只处理编辑模式
      if (isReadOnly) return;

      // Ctrl+S / Cmd+S 保存快捷键
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();

        // 取消计划中的自动保存
        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
          saveTimeoutRef.current = null;
        }

        // 立即保存
        onSave();
      }
    };

    // 仅监听编辑器焦点或全局键盘事件
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isReadOnly, onSave, saveTimeoutRef, editorFocusedRef]);
};

export default useKeyboardSave;
