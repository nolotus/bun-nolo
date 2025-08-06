import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  delay?: number;
  hideDelay?: number;
  placement?: "top" | "bottom" | "left" | "right" | "top-left";
  portalContainer?: HTMLElement;
}

export const Tooltip = ({
  content,
  children,
  delay = 100,
  hideDelay = 100,
  placement = "top",
  portalContainer = document.body,
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const updatePosition = () => {
    if (wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      let top = 0;
      let left = 0;

      if (placement === "top") {
        top = rect.top + window.scrollY - 8;
        left = rect.left + window.scrollX + rect.width / 2;
      } else if (placement === "top-left") {
        top = rect.top + window.scrollY - 8;
        left = rect.right + window.scrollX - rect.width / 2;
      } else if (placement === "bottom") {
        top = rect.bottom + window.scrollY + 8;
        left = rect.left + window.scrollX + rect.width / 2;
      } else if (placement === "left") {
        top = rect.top + window.scrollY + rect.height / 2;
        left = rect.left + window.scrollX - 8;
      } else if (placement === "right") {
        top = rect.top + window.scrollY + rect.height / 2;
        left = rect.right + window.scrollX + 8;
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
    setIsVisible(true);
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
      const handleUpdatePosition = () => updatePosition();
      window.addEventListener("resize", handleUpdatePosition);
      window.addEventListener("scroll", handleUpdatePosition);
      return () => {
        window.removeEventListener("resize", handleUpdatePosition);
        window.removeEventListener("scroll", handleUpdatePosition);
      };
    }
  }, [isVisible]);

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
        display: "block",
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
      {tooltipContent && createPortal(tooltipContent, portalContainer)}
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
          transform-origin: center bottom;
          will-change: opacity, visibility, transform;
        }

        .tooltip-tip[style*="display: block"] {
          opacity: 1;
          visibility: visible;
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

        /* Top placement arrows */
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

        /* Bottom placement arrow */
        .tooltip-bottom .tooltip-arrow {
          top: -3.5px;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
          border-bottom: none;
          border-right: none;
        }

        /* Left placement arrow */
        .tooltip-left .tooltip-arrow {
          right: -3.5px;
          top: 50%;
          transform: translateY(-50%) rotate(45deg);
          border-left: none;
          border-bottom: none;
        }

        /* Right placement arrow */
        .tooltip-right .tooltip-arrow {
          left: -3.5px;
          top: 50%;
          transform: translateY(-50%) rotate(45deg);
          border-right: none;
          border-top: none;
        }

        /* Hover state enhancement */
        .tooltip-tip:hover {
          background: var(--backgroundTertiary);
        }

        /* Animation states for different placements */
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
      `}</style>
    </div>
  );
};
