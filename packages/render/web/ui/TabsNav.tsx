import React from "react";

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
}

const TabsNav: React.FC<TabsNavProps> = ({
  tabs,
  activeTab,
  onChange,
  className = "",
}) => {
  return (
    <nav className={`tabs-nav ${className}`} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          type="button"
          disabled={tab.disabled}
          onClick={() => !tab.disabled && onChange(tab.id)}
          data-active={activeTab === tab.id}
          className="tab-item"
        >
          {tab.label}
        </button>
      ))}

      <style href="tabs-nav" precedence="medium">{`
        .tabs-nav {
          display: flex;
          position: relative;
          border-bottom: 1px solid var(--border);
          gap: var(--space-2);
          padding: 0 var(--space-1);
          overflow-x: auto;
          scrollbar-width: none;
        }

        .tab-item {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px 16px; 
          min-height: 40px;
          min-width: 64px;
          
          background: transparent;
          border: none;
          color: var(--textTertiary);
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s cubic-bezier(0.2, 0, 0, 1);
        }

        /* 底部游标 (伪元素实现，不占空间) */
        .tab-item::after {
          content: "";
          position: absolute;
          bottom: -9px; /* 正好盖在父级 border 上 */
          left: 0;
          width: 100%;
          height: 2px;
          background: var(--primary);
          opacity: 0;
          transform: scaleX(0.6);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* 悬停态：背景轻微浮起 */
        .tab-item:not([disabled]):hover {
          color: var(--text);
          background: var(--backgroundHover);
        }

        /* 激活态：文字加深，游标显示 */
        .tab-item[data-active="true"] {
          color: var(--primary);
          font-weight: 600;
          background: var(--primaryBg); /* 极淡的主题色背景增强识别 */
        }

        .tab-item[data-active="true"]::after {
          opacity: 1;
          transform: scaleX(1);
          box-shadow: 0 -1px 4px var(--primaryGhost); /* 增加一点光感 */
        }

        /* 禁用态 */
        .tab-item[disabled] {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </nav>
  );
};

export default TabsNav;
