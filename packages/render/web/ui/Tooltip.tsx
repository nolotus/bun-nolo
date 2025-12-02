//render/web/ui/Tooltip
import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  delay?: number;
  hideDelay?: number;
  placement?: "top" | "bottom" | "left" | "right" | "top-left" | "top-right";
  className?: string;
}

export const Tooltip = ({
  content,
  children,
  delay = 200,
  hideDelay = 150,
  placement = "top",
  className = "",
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isMounted, setIsMounted] = useState(false);

  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const showTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
    };
  }, []);

  const updatePosition = () => {
    if (!wrapperRef.current || !isVisible) return;

    const rect = wrapperRef.current.getBoundingClientRect();
    const gap = 8; // 间距
    let top = 0;
    let left = 0;

    // 获取滚动偏移量
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    switch (placement) {
      case "top":
        top = rect.top + scrollY - gap;
        left = rect.left + scrollX + rect.width / 2;
        break;
      case "top-left":
        top = rect.top + scrollY - gap;
        left = rect.right + scrollX - rect.width / 2; // 稍微偏向右侧对齐
        break;
      case "top-right":
        top = rect.top + scrollY - gap;
        left = rect.left + scrollX + rect.width / 2;
        break;
      case "bottom":
        top = rect.bottom + scrollY + gap;
        left = rect.left + scrollX + rect.width / 2;
        break;
      case "left":
        top = rect.top + scrollY + rect.height / 2;
        left = rect.left + scrollX - gap;
        break;
      case "right":
        top = rect.top + scrollY + rect.height / 2;
        left = rect.right + scrollX + gap;
        break;
    }
    setPosition({ top, left });
  };

  // 使用 useLayoutEffect 确保在绘制前计算位置，避免闪烁
  useLayoutEffect(() => {
    if (isVisible) {
      updatePosition();
      const handleResizeOrScroll = () => requestAnimationFrame(updatePosition);

      window.addEventListener("resize", handleResizeOrScroll);
      window.addEventListener("scroll", handleResizeOrScroll, true);

      return () => {
        window.removeEventListener("resize", handleResizeOrScroll);
        window.removeEventListener("scroll", handleResizeOrScroll, true);
      };
    }
  }, [isVisible, placement]);

  const handleMouseEnter = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    // 如果已经在显示中，不需要延迟
    if (isVisible) return;

    showTimerRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }

    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, hideDelay);
  };

  const tooltipContent = isVisible ? (
    <div
      ref={tooltipRef}
      className={`tooltip-tip tooltip-${placement}`}
      onMouseEnter={handleMouseEnter} // 允许鼠标移动到 Tooltip 上而不消失
      onMouseLeave={handleMouseLeave}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <div className="tooltip-inner">{content}</div>
      {/* 纯 CSS 实现的箭头，利用伪元素减少 DOM */}
    </div>
  ) : null;

  return (
    <>
      <div
        ref={wrapperRef}
        className={`tooltip-wrapper ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
      >
        {children}
      </div>

      {isMounted && createPortal(tooltipContent, document.body)}

      <style href="ui-tooltip" precedence="high">{`
        .tooltip-wrapper {
          display: inline-flex;
          position: relative;
          line-height: 0; /* 避免产生意外的高度 */
        }

        .tooltip-tip {
          position: absolute;
          z-index: 10000;
          pointer-events: auto;
          
          /* 初始状态：用于动画 */
          opacity: 0;
          transform: scale(0.96);
          animation: tooltip-enter 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          
          /* 视觉风格 */
          background: var(--backgroundGhost);
          color: var(--textSecondary);
          backdrop-filter: blur(12px) saturate(180%);
          border: 1px solid var(--border);
          box-shadow: 
            0 4px 12px var(--shadowMedium),
            0 0 0 1px var(--shadowLight);
          
          border-radius: 8px;
          font-size: 12px;
          line-height: 1.5;
          font-weight: 500;
          max-width: 260px;
          width: max-content;
        }

        .tooltip-inner {
          padding: 6px 10px;
          position: relative;
          z-index: 2;
        }

        /* 箭头通用样式 - 使用伪元素 */
        .tooltip-tip::before {
          content: "";
          position: absolute;
          width: 8px;
          height: 8px;
          background: inherit; /* 继承背景色 */
          border: 1px solid var(--border);
          z-index: 1;
          transform: rotate(45deg);
          box-sizing: border-box;
        }

        /* 动画关键帧 */
        @keyframes tooltip-enter {
          from {
            opacity: 0;
            transform: translate(var(--tx, -50%), var(--ty, 0)) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translate(var(--tx, -50%), var(--ty, 0)) scale(1);
          }
        }

        /* --- 动态定位与箭头方向 --- */

        /* Top */
        .tooltip-top {
          --tx: -50%; --ty: -100%;
          transform-origin: center bottom;
        }
        .tooltip-top::before {
          bottom: -4px;
          left: 50%;
          margin-left: -4px;
          border-top: none;
          border-left: none;
        }

        /* Top-Left */
        .tooltip-top-left {
          --tx: -50%; --ty: -100%;
          transform-origin: right bottom;
        }
        .tooltip-top-left::before {
          bottom: -4px;
          right: 12px;
          border-top: none;
          border-left: none;
        }

         /* Top-Right */
        .tooltip-top-right {
          --tx: -50%; --ty: -100%;
          transform-origin: left bottom;
        }
        .tooltip-top-right::before {
          bottom: -4px;
          left: 12px;
          border-top: none;
          border-left: none;
        }

        /* Bottom */
        .tooltip-bottom {
          --tx: -50%; --ty: 0;
          transform-origin: center top;
        }
        .tooltip-bottom::before {
          top: -4px;
          left: 50%;
          margin-left: -4px;
          border-bottom: none;
          border-right: none;
        }

        /* Left */
        .tooltip-left {
          --tx: -100%; --ty: -50%;
          transform-origin: right center;
        }
        .tooltip-left::before {
          right: -4px;
          top: 50%;
          margin-top: -4px;
          border-bottom: none;
          border-left: none;
        }

        /* Right */
        .tooltip-right {
          --tx: 0; --ty: -50%;
          transform-origin: left center;
        }
        .tooltip-right::before {
          left: -4px;
          top: 50%;
          margin-top: -4px;
          border-top: none;
          border-right: none;
        }

        /* 暗黑模式适配优化：提升对比度 */
        @media (prefers-color-scheme: dark) {
          .tooltip-tip {
            background: var(--backgroundSecondary); /* 暗色模式下稍微实一点，防止太透看不清 */
            border-color: var(--borderHover);
          }
        }
      `}</style>
    </>
  );
};
