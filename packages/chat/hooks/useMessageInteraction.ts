// hooks/useMessageInteraction.ts

import { useState, useCallback, useEffect } from "react";

/**
 * 检测设备类型工具
 */
export const isTouchDevice = () => {
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
};

/**
 * 触觉反馈
 */
export const triggerHapticFeedback = (duration = 50) => {
  if (navigator.vibrate) {
    navigator.vibrate(duration);
  }
};

/**
 * 检查是否点击了交互元素
 */
export const isInteractiveElement = (
  target: Element
): boolean | "text-content" => {
  // 原有交互元素检测
  const isOriginalInteractive =
    target.closest(".actions") ||
    target.closest(".actions-overlay") ||
    target.closest("button") ||
    target.closest(".thinking-toggle") ||
    target.closest(".msg-image") ||
    target.closest("a") ||
    target.closest("input") ||
    target.closest("textarea") ||
    target.closest("[contenteditable]");

  if (isOriginalInteractive) return true;

  // 新增：检测文本内容区域（需要特殊处理的文本）
  const isTextContent =
    target.closest(".message-text") ||
    target.closest(".simple-text") ||
    target.closest(".thinking-editor") ||
    target.matches(".message-text") ||
    target.matches(".simple-text") ||
    target.matches(".thinking-editor");

  // 如果是文本区域，返回特殊标识 - 让hook知道需要特殊处理
  if (isTextContent) {
    return "text-content"; // 特殊返回值，而不是true/false
  }

  return false;
};

interface UseMessageInteractionProps {
  messageId?: string;
  onToggleActions: () => void;
}

export const useMessageInteraction = ({
  messageId,
  onToggleActions,
}: UseMessageInteractionProps) => {
  const [longPressTimer, setLongPressTimer] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const isTouch = isTouchDevice();

  // 清理长按定时器
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  }, [longPressTimer]);

  // 桌面端点击处理
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isTouch) return;
      if (isInteractiveElement(e.target as Element)) return;
      onToggleActions();
    },
    [isTouch, onToggleActions]
  );

  // 移动端长按开始（修改：支持文本区域长按）
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!isTouch) return;

      const interactiveCheck = isInteractiveElement(e.target as Element);

      // 如果是普通交互元素，跳过
      if (interactiveCheck === true) return;

      // 如果是文本内容，需要特殊处理
      if (interactiveCheck === "text-content") {
        // 阻止文本选择的默认行为，但允许我们的长按逻辑
        e.preventDefault();

        // 临时禁用文本选择（在长按期间）
        const textElement = (e.target as Element).closest(
          ".message-text, .simple-text, .thinking-editor"
        );
        if (textElement) {
          (textElement as HTMLElement).style.userSelect = "none";
          (textElement as HTMLElement).style.webkitUserSelect = "none";
        }
      }

      setIsDragging(false);

      const timer = window.setTimeout(() => {
        if (!isDragging) {
          setShowActions(true);
          triggerHapticFeedback();
        }
      }, 500);

      setLongPressTimer(timer);
    },
    [isTouch, isDragging]
  );

  // 移动端触摸移动
  const handleTouchMove = useCallback(() => {
    if (!isTouch) return;
    setIsDragging(true);
    clearLongPressTimer();
  }, [isTouch, clearLongPressTimer]);

  // 移动端触摸结束（修改：恢复文本选择）
  const handleTouchEnd = useCallback(() => {
    if (!isTouch) return;

    // 恢复文本选择（清理所有可能被禁用的文本元素）
    const textElements = document.querySelectorAll(
      ".message-text, .simple-text, .thinking-editor"
    );
    textElements.forEach((el) => {
      (el as HTMLElement).style.userSelect = "";
      (el as HTMLElement).style.webkitUserSelect = "";
    });

    clearLongPressTimer();
    setTimeout(() => setIsDragging(false), 100);
  }, [isTouch, clearLongPressTimer]);

  // 点击空白区域隐藏操作栏
  useEffect(() => {
    if (!showActions) return;

    const handleOutsideClick = (e: Event) => {
      const target = e.target as Element;

      // 如果点击的是操作面板内部，不隐藏
      if (target.closest(".actions-overlay")) return;

      const msgElement = target.closest(".msg");
      const currentMsg = target.closest(`[data-message-id="${messageId}"]`);

      // 如果点击的不是当前消息，隐藏操作栏
      if (msgElement && !currentMsg) {
        setShowActions(false);
      }
      // 如果点击的是空白区域，也隐藏操作栏
      if (!msgElement) {
        setShowActions(false);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener("click", handleOutsideClick, true);
      document.addEventListener("touchend", handleOutsideClick, true);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleOutsideClick, true);
      document.removeEventListener("touchend", handleOutsideClick, true);
    };
  }, [showActions, messageId]);

  // 清理定时器
  useEffect(() => {
    return () => clearLongPressTimer();
  }, [clearLongPressTimer]);

  return {
    isTouch,
    showActions,
    setShowActions,
    handleClick,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};
