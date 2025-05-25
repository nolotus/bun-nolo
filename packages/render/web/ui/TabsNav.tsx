// render/web/ui/TabsNav
import React from "react";
import { useTheme } from "app/theme";

export interface Tab {
  id: number | string;
  label: string;
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
  const theme = useTheme();

  return (
    <div className={`tabs-nav ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}

      <style jsx>{`
        .tabs-nav {
          display: flex;
          border-bottom: 1px solid ${theme.border};
          margin-bottom: 24px;
          gap: 8px;
          padding: 0 4px;
          position: relative;
        }

        .tab-button {
          padding: 12px 20px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          font-size: 14px;
          color: ${theme.textSecondary};
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          white-space: nowrap;
          user-select: none;
          outline: none;
        }

        .tab-button:focus-visible {
          box-shadow: 0 0 0 2px ${theme.primary}40;
          border-radius: 4px;
        }

        .tab-button.active {
          color: ${theme.primary};
          border-bottom: 2px solid ${theme.primary};
          font-weight: 500;
        }

        .tab-button:hover:not(.active) {
          color: ${theme.text};
          background: ${theme.backgroundHover};
          border-radius: 4px 4px 0 0;
        }

        @media (max-width: 640px) {
          .tabs-nav {
            overflow-x: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
            padding: 0;
            gap: 4px;
          }

          .tabs-nav::-webkit-scrollbar {
            display: none;
          }

          .tab-button {
            padding: 10px 16px;
            font-size: 13px;
          }
        }
      `}</style>
    </div>
  );
};

export default TabsNav;
