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
}

const Tabs: React.FC<TabsProps> = ({
  items,
  activeTab,
  onTabChange,
  size = "medium",
  className = "",
}) => {
  return (
    <>
      <nav className={`tabs-navigator ${size} ${className}`}>
        {items.map((item) => (
          <button
            key={item.id}
            className={`tab-item ${size} ${activeTab === item.id ? "active" : ""}`}
            onClick={() => onTabChange(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <style href="ui-tabs-component" precedence="high">{`
        .tabs-navigator {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1);
          background: var(--backgroundSecondary);
          border: 1px solid var(--borderLight);
          padding: var(--space-1);
          box-shadow: 0 2px 6px var(--shadowLight);
        }

        .tab-item {
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 520;
          color: var(--textSecondary);
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.25s ease;
          white-space: nowrap;
        }

        /* Medium Size (Default) */
        .tabs-navigator.medium {
          border-radius: 16px;
        }
        .tab-item.medium {
          padding: var(--space-3) var(--space-4);
          border-radius: 12px;
          font-size: 0.875rem; /* 14px */
          gap: var(--space-2);
          min-width: 120px;
        }
        .tab-item.medium:hover {
          color: var(--primary);
          background: var(--backgroundHover);
        }
        .tab-item.medium.active {
          color: var(--primary);
          background: var(--background);
          font-weight: 600;
          box-shadow: 0 2px 8px var(--shadowLight);
        }

        /* Small Size */
        .tabs-navigator.small {
          border-radius: 10px;
          padding: 2px;
        }
        .tab-item.small {
          height: 32px;
          padding: 0 var(--space-3); /* 12px */
          border-radius: 8px;
          font-size: 0.8125rem; /* 13px */
          gap: var(--space-1);
        }
        .tab-item.small:hover {
          color: var(--text);
        }
        .tab-item.small.active {
          color: var(--background);
          background: var(--primary);
          font-weight: 600;
        }
        .tab-item.small.active:hover {
          color: var(--background);
          background: var(--primary);
        }
      `}</style>
    </>
  );
};

export default Tabs;
