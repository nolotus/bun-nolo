//render/web/ui/Tooltip
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAppSelector } from "app/store";
import { selectTheme } from "app/settings/settingSlice";

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
  const theme = useAppSelector(selectTheme);
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
      style={{ "--tooltip-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
      {tooltipContent && createPortal(tooltipContent, portalContainer)}
      <style jsx>{`
        .tooltip-wrapper {
          position: relative;
          display: inline-block;
        }
        .tooltip-tip {
          background: ${theme.backgroundSecondary};
          color: ${theme.text};
          font-size: 0.8125rem;
          font-weight: 500;
          line-height: 1.3;
          box-shadow:
            0 4px 12px rgba(0, 0, 0, 0.08),
            0 1px 3px rgba(0, 0, 0, 0.06);
          border: 1px solid ${theme.border};
          border-radius: 6px;
          opacity: 0;
          visibility: hidden;
          transition: all 0.12s cubic-bezier(0.4, 0, 0.2, 1)
            var(--tooltip-delay);
          backdrop-filter: blur(8px);
        }
        .tooltip-tip[style*="display: block"] {
          opacity: 1;
          visibility: visible;
        }
        .tooltip-content {
          padding: ${theme.space[2]} ${theme.space[3]};
          white-space: nowrap;
          max-width: 240px;
          word-break: break-word;
        }
        .tooltip-arrow {
          position: absolute;
          width: 7px;
          height: 7px;
          background: ${theme.backgroundSecondary};
          border: 1px solid ${theme.border};
        }

        .tooltip-top .tooltip-arrow,
        .tooltip-top-left .tooltip-arrow {
          bottom: -4px;
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
          top: -4px;
          left: 50%;
          transform: translateX(-50%) rotate(45deg);
          border-bottom: none;
          border-right: none;
        }

        .tooltip-left .tooltip-arrow {
          right: -4px;
          top: 50%;
          transform: translateY(-50%) rotate(45deg);
          border-left: none;
          border-bottom: none;
        }

        .tooltip-right .tooltip-arrow {
          left: -4px;
          top: 50%;
          transform: translateY(-50%) rotate(45deg);
          border-right: none;
          border-top: none;
        }
      `}</style>
    </div>
  );
};
