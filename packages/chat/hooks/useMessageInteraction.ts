// hooks/useMessageInteraction.ts

import { useState, useCallback, useEffect, useRef } from "react";

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

  // 检测文本内容区域
  const isTextContent =
    target.closest(".message-text") ||
    target.closest(".simple-text") ||
    target.closest(".thinking-editor") ||
    target.matches(".message-text") ||
    target.matches(".simple-text") ||
    target.matches(".thinking-editor");

  if (isTextContent) {
    return "text-content";
  }

  return false;
};

interface UseMessageInteractionProps {
  messageId?: string;
  onToggleActions: () => void;
}

interface TouchPosition {
  x: number;
  y: number;
}

interface InteractionState {
  isTextSelectionMode: boolean;
  selectionStarted: boolean;
  isDragging: boolean;
}

// 常量配置
const INTERACTION_CONFIG = {
  LONG_PRESS_DELAY: 500,
  INTENT_CHECK_DELAY: 100,
  SELECTION_THRESHOLD: 10,
  DRAG_THRESHOLD: 30,
  MENU_HEIGHT: 200,
  RESET_DELAY: 100,
} as const;

export const useMessageInteraction = ({
  messageId,
  onToggleActions,
}: UseMessageInteractionProps) => {
  // 核心状态
  const [showActions, setShowActions] = useState(false);

  // 使用 useRef 优化频繁变化的状态，避免重渲染
  const timersRef = useRef<{
    longPress: number | null;
    intentCheck: number | null;
    reset: number | null;
  }>({
    longPress: null,
    intentCheck: null,
    reset: null,
  });

  const touchStateRef = useRef<TouchPosition | null>(null);
  const interactionStateRef = useRef<InteractionState>({
    isTextSelectionMode: false,
    selectionStarted: false,
    isDragging: false,
  });

  const cleanupFnsRef = useRef<Map<Element, () => void>>(new Map());

  const isTouch = isTouchDevice();

  // 🎯 智能滚动优化：确保操作上下文可见
  const ensureOptimalViewPosition = useCallback(
    (messageElement: Element, touchY: number) => {
      const rect = messageElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      // 如果消息底部被菜单遮挡，平滑滚动调整
      const isBottomObscured =
        rect.bottom > viewportHeight - INTERACTION_CONFIG.MENU_HEIGHT;
      const isTouchInLowerHalf = touchY > viewportHeight / 2;

      if (isBottomObscured || isTouchInLowerHalf) {
        const scrollTarget = Math.max(
          0,
          window.scrollY +
            rect.bottom -
            viewportHeight +
            INTERACTION_CONFIG.MENU_HEIGHT +
            20
        );

        // 延迟滚动，避免与菜单动画冲突
        setTimeout(() => {
          window.scrollTo({
            top: scrollTarget,
            behavior: "smooth",
          });
        }, INTERACTION_CONFIG.INTENT_CHECK_DELAY);
      }
    },
    []
  );

  // 清理所有定时器
  const clearAllTimers = useCallback(() => {
    Object.values(timersRef.current).forEach((timer) => {
      if (timer) clearTimeout(timer);
    });
    timersRef.current = {
      longPress: null,
      intentCheck: null,
      reset: null,
    };
  }, []);

  // 清理文本选择样式
  const clearTextSelection = useCallback(() => {
    const textElements = document.querySelectorAll(
      ".message-text, .simple-text, .thinking-editor"
    );
    textElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.userSelect = "";
      htmlEl.style.webkitUserSelect = "";

      // 清理绑定的清理函数
      const cleanup = cleanupFnsRef.current.get(el);
      if (cleanup) {
        cleanup();
        cleanupFnsRef.current.delete(el);
      }
    });
  }, []);

  // 重置交互状态
  const resetInteractionState = useCallback(() => {
    interactionStateRef.current = {
      isTextSelectionMode: false,
      selectionStarted: false,
      isDragging: false,
    };
    touchStateRef.current = null;
  }, []);

  // 桌面端点击处理
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isTouch) return;
      if (isInteractiveElement(e.target as Element)) return;
      onToggleActions();
    },
    [isTouch, onToggleActions]
  );

  // 🎯 核心：智能长按开始处理
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!isTouch) return;

      const interactiveCheck = isInteractiveElement(e.target as Element);
      if (interactiveCheck === true) return;

      const touch = e.touches[0];
      touchStateRef.current = { x: touch.clientX, y: touch.clientY };
      resetInteractionState();
      clearAllTimers();

      const targetElement = e.target as Element;

      // 🎯 文本内容的智能处理
      if (interactiveCheck === "text-content") {
        const textElement = targetElement.closest(
          ".message-text, .simple-text, .thinking-editor"
        );

        // 短延迟后检查用户意图
        timersRef.current.intentCheck = window.setTimeout(() => {
          if (
            !interactionStateRef.current.isDragging &&
            !interactionStateRef.current.selectionStarted
          ) {
            // 用户没有开始选择文字 → 准备弹出菜单
            e.preventDefault();
            if (textElement) {
              const htmlEl = textElement as HTMLElement;
              htmlEl.style.userSelect = "none";
              htmlEl.style.webkitUserSelect = "none";
            }
          }
        }, INTERACTION_CONFIG.INTENT_CHECK_DELAY);

        // 长按定时器：弹出菜单
        timersRef.current.longPress = window.setTimeout(() => {
          if (
            !interactionStateRef.current.isDragging &&
            !interactionStateRef.current.isTextSelectionMode
          ) {
            const messageElement = targetElement.closest(".msg");
            if (messageElement) {
              ensureOptimalViewPosition(messageElement, touch.clientY);
            }
            setShowActions(true);
            triggerHapticFeedback();
          }
        }, INTERACTION_CONFIG.LONG_PRESS_DELAY);

        // 监听文本选择开始
        const handleSelectionStart = () => {
          interactionStateRef.current.selectionStarted = true;
          interactionStateRef.current.isTextSelectionMode = true;
          clearAllTimers();
        };

        // 优化：使用 AbortController 管理事件监听器
        const abortController = new AbortController();
        document.addEventListener("selectionchange", handleSelectionStart, {
          once: true,
          signal: abortController.signal,
        });

        // 保存清理函数
        const cleanup = () => {
          abortController.abort();
          clearAllTimers();
        };

        cleanupFnsRef.current.set(targetElement, cleanup);
      } else {
        // 非文本区域：直接长按弹出菜单
        timersRef.current.longPress = window.setTimeout(() => {
          if (!interactionStateRef.current.isDragging) {
            const messageElement = targetElement.closest(".msg");
            if (messageElement) {
              ensureOptimalViewPosition(messageElement, touch.clientY);
            }
            setShowActions(true);
            triggerHapticFeedback();
          }
        }, INTERACTION_CONFIG.LONG_PRESS_DELAY);
      }
    },
    [isTouch, ensureOptimalViewPosition, clearAllTimers, resetInteractionState]
  );

  // 🎯 触摸移动：检测拖拽意图
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isTouch || !touchStateRef.current) return;

      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - touchStateRef.current.x);
      const deltaY = Math.abs(touch.clientY - touchStateRef.current.y);
      const moveDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // 智能阈值：区分文本选择 vs 意外移动
      if (
        moveDistance > INTERACTION_CONFIG.SELECTION_THRESHOLD &&
        !interactionStateRef.current.isTextSelectionMode
      ) {
        if (moveDistance > INTERACTION_CONFIG.DRAG_THRESHOLD) {
          interactionStateRef.current.isDragging = true;
          clearAllTimers();
        } else {
          // 小幅移动 → 可能是精确选择文字
          const interactiveCheck = isInteractiveElement(e.target as Element);
          if (interactiveCheck === "text-content") {
            interactionStateRef.current.isTextSelectionMode = true;
          }
        }
      }
    },
    [isTouch, clearAllTimers]
  );

  // 🎯 触摸结束：清理和状态重置
  const handleTouchEnd = useCallback(() => {
    if (!isTouch) return;

    clearAllTimers();
    clearTextSelection();

    // 延迟重置状态，避免状态抖动
    timersRef.current.reset = window.setTimeout(() => {
      resetInteractionState();
    }, INTERACTION_CONFIG.RESET_DELAY);
  }, [isTouch, clearAllTimers, clearTextSelection, resetInteractionState]);

  // 🎯 文本选择状态监听（优化：防抖处理）
  useEffect(() => {
    let timeoutId: number;

    const handleSelectionChange = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
          setShowActions(false);
        }
      }, 50); // 防抖50ms
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      clearTimeout(timeoutId);
    };
  }, []);

  // 点击空白区域隐藏操作栏
  useEffect(() => {
    if (!showActions) return;

    const handleOutsideClick = (e: Event) => {
      const target = e.target as Element;

      if (target.closest(".actions-overlay")) return;

      const msgElement = target.closest(".msg");
      const currentMsg = target.closest(`[data-message-id="${messageId}"]`);

      if ((msgElement && !currentMsg) || !msgElement) {
        setShowActions(false);
      }
    };

    // 延迟绑定，避免立即触发
    const timer = setTimeout(() => {
      document.addEventListener("click", handleOutsideClick, true);
      document.addEventListener("touchend", handleOutsideClick, true);
    }, INTERACTION_CONFIG.INTENT_CHECK_DELAY);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleOutsideClick, true);
      document.removeEventListener("touchend", handleOutsideClick, true);
    };
  }, [showActions, messageId]);

  // 组件卸载时清理所有资源
  useEffect(() => {
    return () => {
      clearAllTimers();
      clearTextSelection();
      resetInteractionState();
    };
  }, [clearAllTimers, clearTextSelection, resetInteractionState]);

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
