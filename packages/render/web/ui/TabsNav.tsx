// render/web/ui/TabsNav
import React from "react";
import { selectTheme } from "app/settings/settingSlice";
import { useAppSelector } from "app/store";

export interface Tab {
  id: number | string;
  label: string;
  disabled?: boolean;
}

interface TabsNavProps {
  tabs: Tab[];
  activeTab: number | string;
  onChange: (tabId: number | string) => void;
  className?: string;
  size?: "small" | "medium" | "large";
}

const TabsNav: React.FC<TabsNavProps> = ({
  tabs,
  activeTab,
  onChange,
  className = "",
  size = "medium",
}) => {
  const theme = useAppSelector(selectTheme);

  // 根据尺寸计算样式
  const getSizeStyles = (size: string) => {
    switch (size) {
      case "small":
        return {
          padding: `${theme.space[2]} ${theme.space[3]}`,
          fontSize: "13px",
          gap: theme.space[1],
        };
      case "large":
        return {
          padding: `${theme.space[4]} ${theme.space[6]}`,
          fontSize: "15px",
          gap: theme.space[3],
        };
      default: // medium
        return {
          padding: `${theme.space[3]} ${theme.space[5]}`,
          fontSize: "14px",
          gap: theme.space[2],
        };
    }
  };

  const sizeStyles = getSizeStyles(size);

  return (
    <div className={`tabs-nav ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`tab-button ${activeTab === tab.id ? "active" : ""} ${tab.disabled ? "disabled" : ""}`}
          onClick={() => !tab.disabled && onChange(tab.id)}
          disabled={tab.disabled}
          aria-selected={activeTab === tab.id}
          role="tab"
        >
          {tab.label}
        </button>
      ))}

      <style jsx>{`
        /* 使用场景：通用标签页导航，适用于内容管理、表单步骤、数据展示等场景 */

        .tabs-nav {
          display: flex;
          position: relative;
          border-bottom: 1px solid ${theme.border};
          margin-bottom: ${theme.space[6]};
          gap: ${sizeStyles.gap};
          padding: 0 ${theme.space[1]};
          overflow-x: auto;
          scrollbar-width: none;
          -webkit-overflow-scrolling: touch;
        }

        .tabs-nav::-webkit-scrollbar {
          display: none;
        }

        .tab-button {
          padding: ${sizeStyles.padding};
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          font-size: ${sizeStyles.fontSize};
          font-weight: 450;
          color: ${theme.textTertiary};
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          white-space: nowrap;
          user-select: none;
          outline: none;
          border-radius: ${theme.space[1]} ${theme.space[1]} 0 0;
          min-height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* 轻微拟物化效果 - 增加深度感 */
        .tab-button::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            180deg,
            ${theme.backgroundAccent || theme.backgroundHover}50 0%,
            transparent 100%
          );
          border-radius: inherit;
          opacity: 0;
          transition: opacity 0.25s ease;
        }

        /* 焦点可访问性 */
        .tab-button:focus-visible {
          box-shadow:
            0 0 0 2px ${theme.focus || theme.primary + "30"},
            inset 0 1px 0 ${theme.primaryGhost || "rgba(255, 255, 255, 0.1)"};
          background: ${theme.backgroundHover};
        }

        /* 激活状态 */
        .tab-button.active {
          color: ${theme.primary};
          border-bottom-color: ${theme.primary};
          font-weight: 500;
          background: ${theme.background};
          box-shadow:
            0 -1px 0 ${theme.border},
            0 1px 0 ${theme.background};
        }

        .tab-button.active::before {
          opacity: 1;
        }

        /* 悬停效果 */
        .tab-button:hover:not(.active):not(.disabled) {
          color: ${theme.text};
          background: ${theme.backgroundHover};
          transform: translateY(-1px);
          box-shadow: 0 2px 8px ${theme.shadowLight};
        }

        .tab-button:hover:not(.active):not(.disabled)::before {
          opacity: 0.5;
        }

        /* 按下效果 */
        .tab-button:active:not(.disabled) {
          transform: translateY(0);
          transition: transform 0.1s ease;
        }

        /* 禁用状态 */
        .tab-button.disabled {
          color: ${theme.textLight};
          cursor: not-allowed;
          opacity: 0.5;
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .tabs-nav {
            gap: ${theme.space[1]};
            padding: 0;
            margin-bottom: ${theme.space[4]};
          }

          .tab-button {
            padding: ${theme.space[2]} ${theme.space[3]};
            font-size: 13px;
            min-height: 40px;
          }
        }

        @media (max-width: 480px) {
          .tab-button {
            padding: ${theme.space[2]} ${theme.space[2]};
            font-size: 12px;
            min-height: 36px;
          }
        }

        /* 减少动画播放（尊重用户偏好） */
        @media (prefers-reduced-motion: reduce) {
          .tab-button,
          .tab-button::before {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};

export default TabsNav;
