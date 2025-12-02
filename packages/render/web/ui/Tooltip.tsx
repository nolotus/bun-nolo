//render/web/ui/Tooltip
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  delay?: number;
  hideDelay?: number;
  placement?: "top" | "bottom" | "left" | "right" | "top-left";
}

export const Tooltip = ({
  content,
  children,
  delay = 100,
  hideDelay = 100,
  placement = "top",
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // 新增状态：确保只在客户端环境下才访问 document.body
  const [isMounted, setIsMounted] = useState(false);

  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 此 Effect 在组件挂载到客户端后运行一次
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const updatePosition = () => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      let top = 0;
      let left = 0;

      switch (placement) {
        case "top":
          top = rect.top + window.scrollY - 8;
          left = rect.left + window.scrollX + rect.width / 2;
          break;
        case "top-left":
          top = rect.top + window.scrollY - 8;
          left = rect.right + window.scrollX - rect.width / 2;
          break;
        case "bottom":
          top = rect.bottom + window.scrollY + 8;
          left = rect.left + window.scrollX + rect.width / 2;
          break;
        case "left":
          top = rect.top + window.scrollY + rect.height / 2;
          left = rect.left + window.scrollX - 8;
          break;
        case "right":
          top = rect.top + window.scrollY + rect.height / 2;
          left = rect.right + window.scrollX + 8;
          break;
      }
      setPosition({ top, left });
    }
  };

  const handleMouseEnter = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setIsVisible(true);
    updatePosition();
  };

  const handleMouseLeave = () => {
    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, hideDelay);
  };

  const handleTooltipMouseEnter = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const handleTooltipMouseLeave = () => {
    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, hideDelay);
  };

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      const handleUpdatePosition = () => requestAnimationFrame(updatePosition);
      window.addEventListener("resize", handleUpdatePosition);
      window.addEventListener("scroll", handleUpdatePosition, true);
      return () => {
        window.removeEventListener("resize", handleUpdatePosition);
        window.removeEventListener("scroll", handleUpdatePosition, true);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, placement]);

  const tooltipContent = isVisible ? (
    <div
      className={`tooltip-tip tooltip-${placement}`}
      onMouseEnter={handleTooltipMouseEnter}
      onMouseLeave={handleTooltipMouseLeave}
      style={{
        position: "absolute",
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: placement.includes("top")
          ? "translateX(-50%) translateY(-100%)"
          : placement.includes("bottom")
            ? "translateX(-50%)"
            : placement === "left"
              ? "translateY(-50%) translateX(-100%)"
              : placement === "right"
                ? "translateY(-50%)"
                : "translateX(-50%) translateY(-100%)",
        zIndex: 9999,
        ["--tooltip-delay" as string]: `${delay}ms`,
      }}
    >
      <div className="tooltip-content">{content}</div>
      <div className="tooltip-arrow" />
    </div>
  ) : null;

  return (
    <div
      ref={wrapperRef}
      className="tooltip-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {/* 仅在客户端挂载后才将 Tooltip 渲染到 document.body */}
      {isMounted && tooltipContent
        ? createPortal(tooltipContent, document.body)
        : null}
      <style jsx>{`
        .tooltip-wrapper {
          position: relative;
          display: inline-block;
        }

        .tooltip-tip {
          background: var(--backgroundSecondary);
          color: var(--text);
          font-size: 0.8125rem;
          font-weight: 500;
          line-height: 1.4;
          box-shadow:
            var(--shadowMedium),
            0 0 0 1px var(--borderLight);
          border-radius: 8px;
          opacity: 0;
          visibility: hidden;
          transition:
            opacity 0.16s cubic-bezier(0.16, 1, 0.3, 1) var(--tooltip-delay),
            visibility 0.16s cubic-bezier(0.16, 1, 0.3, 1) var(--tooltip-delay),
            transform 0.16s cubic-bezier(0.16, 1, 0.3, 1) var(--tooltip-delay);
          backdrop-filter: blur(12px) saturate(150%);
          border: 1px solid var(--border);
          will-change: opacity, visibility, transform;
        }

        .tooltip-tip[style*="top"] {
          opacity: 1;
          visibility: visible;
        }

        .tooltip-top {
          transform-origin: center bottom;
        }
        .tooltip-top-left {
          transform-origin: right bottom;
        }
        .tooltip-bottom {
          transform-origin: center top;
        }
        .tooltip-left {
          transform-origin: right center;
        }
        .tooltip-right {
          transform-origin: left center;
        }

        .tooltip-content {
          padding: var(--space-2) var(--space-3);
          white-space: nowrap;
          max-width: 280px;
          word-break: break-word;
          position: relative;
          z-index: 1;
        }

        .tooltip-arrow {
          position: absolute;
          width: 6px;
          height: 6px;
          background: var(--backgroundSecondary);
          border: 1px solid var(--border);
          z-index: 0;
        }

        .tooltip-top .tooltip-arrow,
        .tooltip-top-left .tooltip-arrow {
          bottom: -3.5px;
          transform: rotate(45deg);
          border-top: none;
          border-left: none;
        }
        .tooltip-top .tooltip-arrow {
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
        }
        .tooltip-top-left .tooltip-arrow {
          right: 50%;
          transform: translateX(50%) rotate(45deg);
        }
        .tooltip-bottom .tooltip-arrow {
          top: -3.5px;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
          border-bottom: none;
          border-right: none;
        }
        .tooltip-left .tooltip-arrow {
          right: -3.5px;
          top: 50%;
          transform: translateY(-50%) rotate(45deg);
          border-left: none;
          border-bottom: none;
        }
        .tooltip-right .tooltip-arrow {
          left: -3.5px;
          top: 50%;
          transform: translateY(-50%) rotate(45deg);
          border-right: none;
          border-top: none;
        }

        .tooltip-tip:hover {
          background: var(--backgroundTertiary);
        }
      `}</style>
    </div>
  );
};
