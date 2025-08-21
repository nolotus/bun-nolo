// hooks/useMessageInteraction.ts

import { useState, useCallback, useEffect } from "react";

// utils/deviceUtils.ts

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
export const isInteractiveElement = (target: Element) => {
  return (
    target.closest(".actions") ||
    target.closest(".actions-overlay") ||
    target.closest("button") ||
    target.closest(".thinking-toggle") ||
    target.closest(".msg-image") ||
    target.closest("a") ||
    target.closest("input") ||
    target.closest("textarea") ||
    target.closest("[contenteditable]")
  );
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

  // 移动端长按开始
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!isTouch) return;
      if (isInteractiveElement(e.target as Element)) return;

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

  // 移动端触摸结束
  const handleTouchEnd = useCallback(() => {
    if (!isTouch) return;
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
