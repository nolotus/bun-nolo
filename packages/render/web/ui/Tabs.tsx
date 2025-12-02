// file: src/components/ui/Tabs.tsx
import React from "react";

export interface TabItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  size?: "medium" | "small";
  className?: string;
  /** 是否占满宽度 */
  block?: boolean;
}

const Tabs: React.FC<TabsProps> = ({
  items,
  activeTab,
  onTabChange,
  size = "medium",
  className = "",
  block = false,
}) => {
  return (
    <>
      <nav
        className={`tabs-navigator ${size} ${block ? "block" : ""} ${className}`}
        role="tablist"
      >
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              role="tab"
              aria-selected={isActive}
              className={`tab-item ${size} ${isActive ? "active" : ""}`}
              onClick={() => onTabChange(item.id)}
            >
              {item.icon && <span className="tab-icon">{item.icon}</span>}
              <span className="tab-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <style href="ui-tabs-component" precedence="high">{`
        :root {
          --tab-ease: cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        /* 容器：拟物化的“凹槽”设计 */
        .tabs-navigator {
          position: relative;
          display: inline-flex;
          align-items: center;
          padding: 4px;
          background: var(--backgroundSecondary);
          border-radius: 9999px; /* 胶囊形状 */
          /* 40% 拟物：微弱的内阴影营造深度 */
          box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04), inset 0 0 0 1px rgba(0,0,0,0.02);
          gap: 4px;
          user-select: none;
        }

        .tabs-navigator.block {
          display: flex;
          width: 100%;
        }

        .tabs-navigator.block .tab-item {
          flex: 1;
        }

        /* Tab 项：基础样式 */
        .tab-item {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: none;
          background: transparent;
          color: var(--textTertiary);
          font-family: inherit;
          font-weight: 500; /* 纤细感 */
          cursor: pointer;
          transition: all 0.3s var(--tab-ease);
          white-space: nowrap;
          border-radius: 9999px;
          z-index: 1;
          outline: none;
        }

        .tab-icon {
          display: flex;
          align-items: center;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        /* 悬停状态 */
        .tab-item:not(.active):hover {
          color: var(--textSecondary);
          background: rgba(0, 0, 0, 0.03); /* 极淡的背景 */
        }
        .dark .tab-item:not(.active):hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .tab-item:not(.active):hover .tab-icon {
          opacity: 1;
        }

        /* 激活状态：浮起的“实体卡片” */
        .tab-item.active {
          background: var(--background);
          color: var(--primary); /* 选中高亮色 */
          /* 拟物投影：柔和且有层次 */
          box-shadow: 
            0 2px 8px rgba(0, 0, 0, 0.08), 
            0 1px 2px rgba(0, 0, 0, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 0.5); /* 顶部微高光 */
        }
        
        .dark .tab-item.active {
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            background: rgba(255,255,255,0.1);
            color: var(--text);
        }

        .tab-item.active .tab-icon {
          opacity: 1;
          color: inherit;
        }

        /* 点击反馈 */
        .tab-item:active {
          transform: scale(0.96);
        }

        /* --- 尺寸变体 --- */

        /* Medium (Default) - 适合主导航 */
        .tabs-navigator.medium {
          padding: 5px;
        }
        .tab-item.medium {
          height: 36px;
          padding: 0 20px;
          font-size: 0.9rem;
        }

        /* Small - 适合密集区域 */
        .tabs-navigator.small {
          padding: 3px;
        }
        .tab-item.small {
          height: 28px;
          padding: 0 14px;
          font-size: 0.8125rem;
          gap: 4px;
        }
        
        /* 聚焦状态 Accessibility */
        .tab-item:focus-visible {
            box-shadow: 0 0 0 2px var(--background), 0 0 0 4px var(--primary-alpha-50);
        }

        @media (max-width: 480px) {
           /* 移动端优化 */
           .tab-item.medium { padding: 0 16px; font-size: 0.85rem; }
        }
      `}</style>
    </>
  );
};

export default Tabs;
