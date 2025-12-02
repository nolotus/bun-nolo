import React from "react";
import AgentBlock from "ai/agent/web/AgentBlock";

interface AgentListViewProps {
  items: any[]; // 建议替换为具体的 Agent 类型，如 AgentItem[]
  onReload?: () => void;
}

const AgentListView: React.FC<AgentListViewProps> = ({ items, onReload }) => {
  return (
    <>
      <div className="cybots-grid">
        {items.map((item) => (
          <AgentBlock key={item.id} item={item} reload={onReload} />
        ))}
      </div>

      <style>{`
        .cybots-grid { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
          gap: var(--space-5); 
        }

        @media (max-width: 768px) {
          .cybots-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
        }
        
        @media (max-width: 480px) {
          .cybots-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
};

export default AgentListView;
