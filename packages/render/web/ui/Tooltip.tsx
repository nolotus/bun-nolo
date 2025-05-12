// render/web/ui/Tooltip.tsx

import React, { useState, useRef } from "react";
import { useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  delay?: number;
  hideDelay?: number;
  placement?: "top" | "bottom" | "left" | "right" | string;
}

export const Tooltip = ({
  content,
  children,
  delay = 200,
  hideDelay = 200,
  placement = "top",
}: TooltipProps) => {
  const basePlacement = placement.split("-")[0] as
    | "top"
    | "bottom"
    | "left"
    | "right";
  const theme = useAppSelector(selectTheme);
  const [isVisible, setIsVisible] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 鼠标进入子元素时显示 Tooltip
  const handleMouseEnter = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setIsVisible(true);
  };

  // 鼠标离开子元素时开始隐藏计时
  const handleMouseLeave = () => {
    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, hideDelay);
  };

  // 鼠标进入 Tooltip 区域时保持显示
  const handleTooltipMouseEnter = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setIsVisible(true);
  };

  // 鼠标离开 Tooltip 区域时隐藏
  const handleTooltipMouseLeave = () => {
    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, hideDelay);
  };

  // 清理定时器
  React.useEffect(() => {
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      className="tooltip-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ "--tooltip-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
      <div
        className={`tooltip-tip tooltip-${basePlacement}`}
        onMouseEnter={handleTooltipMouseEnter}
        onMouseLeave={handleTooltipMouseLeave}
        style={{ display: isVisible ? "block" : "none" }}
      >
        <div className="tooltip-content">{content}</div>
        <div className="tooltip-arrow" />
      </div>

      <style jsx>{`
        .tooltip-wrapper {
          position: relative;
          display: inline-block;
        }
        .tooltip-tip {
          position: absolute;
          background: ${theme.backgroundSecondary};
          color: ${theme.text};
          font-size: 0.875rem;
          line-height: 1.4;
          z-index: 1000;
          box-shadow: 0 3px 10px ${theme.shadowMedium};
          border: 1px solid ${theme.border};
          border-radius: 6px;
          opacity: 0;
          visibility: hidden;
          transition:
            opacity 200ms cubic-bezier(0.16, 1, 0.3, 1) var(--tooltip-delay),
            transform 200ms cubic-bezier(0.16, 1, 0.3, 1) var(--tooltip-delay);
        }
        .tooltip-tip[style*="display: block"] {
          opacity: 1;
          visibility: visible;
        }
        .tooltip-content {
          padding: ${theme.space[2]} ${theme.space[3]};
          white-space: nowrap;
        }
        /* Top 方向 Tooltip 调整 */
        .tooltip-top {
          bottom: calc(100% + ${theme.space[2]});
          left: 50%;
          transform: translateX(-50%) translateY(${theme.space[1]}) scale(0.96);
        }
        .tooltip-tip[style*="display: block"].tooltip-top {
          transform: translateX(-50%) translateY(0) scale(1);
        }
        .tooltip-top .tooltip-arrow {
          position: absolute;
          left: 50%;
          bottom: -5px;
          transform: translateX(-50%) rotate(45deg);
          width: 9px;
          height: 9px;
          background: ${theme.backgroundSecondary};
          border: 1px solid ${theme.border};
          border-top: none;
          border-left: none;
        }
        /* Bottom 方向 Tooltip 调整 */
        .tooltip-bottom {
          top: calc(100% + ${theme.space[2]});
          left: 50%;
          transform: translateX(-50%) translateY(-${theme.space[1]}) scale(0.96);
        }
        .tooltip-tip[style*="display: block"].tooltip-bottom {
          transform: translateX(-50%) translateY(0) scale(1);
        }
        .tooltip-bottom .tooltip-arrow {
          position: absolute;
          left: 50%;
          top: -5px;
          transform: translateX(-50%) rotate(45deg);
          width: 9px;
          height: 9px;
          background: ${theme.backgroundSecondary};
          border: 1px solid ${theme.border};
          border-bottom: none;
          border-right: none;
        }
        /* Left 方向 Tooltip 调整 */
        .tooltip-left {
          right: calc(100% + ${theme.space[2]});
          top: 50%;
          transform: translateY(-50%) translateX(${theme.space[1]}) scale(0.96);
        }
        .tooltip-tip[style*="display: block"].tooltip-left {
          transform: translateY(-50%) translateX(0) scale(1);
        }
        .tooltip-left .tooltip-arrow {
          position: absolute;
          right: -5px;
          top: 50%;
          transform: translateY(-50%) rotate(45deg);
          width: 9px;
          height: 9px;
          background: ${theme.backgroundSecondary};
          border: 1px solid ${theme.border};
          border-right: none;
          border-top: none;
        }
        /* Right 方向 Tooltip 调整 */
        .tooltip-right {
          left: calc(100% + ${theme.space[2]});
          top: 50%;
          transform: translateY(-50%) translateX(-${theme.space[1]}) scale(0.96);
        }
        .tooltip-tip[style*="display: block"].tooltip-right {
          transform: translateY(-50%) translateX(0) scale(1);
        }
        .tooltip-right .tooltip-arrow {
          position: absolute;
          left: -5px;
          top: 50%;
          transform: translateY(-50%) rotate(45deg);
          width: 9px;
          height: 9px;
          background: ${theme.backgroundSecondary};
          border: 1px solid ${theme.border};
          border-left: none;
          border-bottom: none;
        }
      `}</style>
    </div>
  );
};
