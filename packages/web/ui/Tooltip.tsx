import React from "react";
import { useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  delay?: number;
  placement?: "top" | "bottom" | "left" | "right" | string;
}

export const Tooltip = ({
  content,
  children,
  delay = 200,
  placement = "top",
}: TooltipProps) => {
  // 只取基础方向（例如 "top-start" 仅取 "top"）
  const basePlacement = placement.split("-")[0] as
    | "top"
    | "bottom"
    | "left"
    | "right";
  const theme = useAppSelector(selectTheme);

  return (
    <div
      className="tooltip-wrapper"
      style={{ "--tooltip-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
      <div className={`tooltip-tip tooltip-${basePlacement}`}>
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
          box-shadow: 0 4px 12px ${theme.shadowMedium};
          border: 1px solid ${theme.border};
          border-radius: 6px;
          opacity: 0;
          visibility: hidden;
          transition:
            opacity 200ms cubic-bezier(0.16, 1, 0.3, 1) var(--tooltip-delay),
            transform 200ms cubic-bezier(0.16, 1, 0.3, 1) var(--tooltip-delay);
        }
        .tooltip-wrapper:hover .tooltip-tip,
        .tooltip-wrapper:focus-within .tooltip-tip {
          opacity: 1;
          visibility: visible;
        }
        .tooltip-content {
          padding: 6px 12px;
          white-space: nowrap;
        }
        /* Top 方向 Tooltip 调整 */
        .tooltip-top {
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%) translateY(4px) scale(0.96);
        }
        .tooltip-wrapper:hover .tooltip-top,
        .tooltip-wrapper:focus-within .tooltip-top {
          transform: translateX(-50%) translateY(0) scale(1);
        }
        .tooltip-top .tooltip-arrow {
          position: absolute;
          left: 50%;
          bottom: -4px;
          transform: translateX(-50%) rotate(45deg);
          width: 8px;
          height: 8px;
          background: ${theme.backgroundSecondary};
          border: 1px solid ${theme.border};
          /* 移除上边和左边的边框，使箭头只在底右两边显示 */
          border-top: none;
          border-left: none;
        }
        /* Bottom 方向 Tooltip 调整 */
        .tooltip-bottom {
          top: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%) translateY(-4px) scale(0.96);
        }
        .tooltip-wrapper:hover .tooltip-bottom,
        .tooltip-wrapper:focus-within .tooltip-bottom {
          transform: translateX(-50%) translateY(0) scale(1);
        }
        .tooltip-bottom .tooltip-arrow {
          position: absolute;
          left: 50%;
          top: -4px;
          transform: translateX(-50%) rotate(45deg);
          width: 8px;
          height: 8px;
          background: ${theme.backgroundSecondary};
          border: 1px solid ${theme.border};
          /* 移除下边和右边的边框 */
          border-bottom: none;
          border-right: none;
        }
        /* Left 方向 Tooltip 调整 */
        .tooltip-left {
          right: calc(100% + 8px);
          top: 50%;
          transform: translateY(-50%) translateX(4px) scale(0.96);
        }
        .tooltip-wrapper:hover .tooltip-left,
        .tooltip-wrapper:focus-within .tooltip-left {
          transform: translateY(-50%) translateX(0) scale(1);
        }
        .tooltip-left .tooltip-arrow {
          position: absolute;
          right: -4px;
          top: 50%;
          transform: translateY(-50%) rotate(45deg);
          width: 8px;
          height: 8px;
          background: ${theme.backgroundSecondary};
          border: 1px solid ${theme.border};
          /* 移除右边和上边的边框 */
          border-right: none;
          border-top: none;
        }
        /* Right 方向 Tooltip 调整 */
        .tooltip-right {
          left: calc(100% + 8px);
          top: 50%;
          transform: translateY(-50%) translateX(-4px) scale(0.96);
        }
        .tooltip-wrapper:hover .tooltip-right,
        .tooltip-wrapper:focus-within .tooltip-right {
          transform: translateY(-50%) translateX(0) scale(1);
        }
        .tooltip-right .tooltip-arrow {
          position: absolute;
          left: -4px;
          top: 50%;
          transform: translateY(-50%) rotate(45deg);
          width: 8px;
          height: 8px;
          background: ${theme.backgroundSecondary};
          border: 1px solid ${theme.border};
          /* 移除左边和下边的边框 */
          border-left: none;
          border-bottom: none;
        }
      `}</style>
    </div>
  );
};
