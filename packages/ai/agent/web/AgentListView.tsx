import React from "react";
import AgentBlock from "ai/agent/web/AgentBlock";

interface AgentListViewProps {
  items: any[]; // TODO: 建议替换为具体的 Agent 类型，如 AgentItem[]
  onReload?: () => void;
}

/**
 * 仅负责展示网格列表，不处理空状态。
 * 空状态由上层容器组件（如页面级组件）负责。
 */
const AgentListView: React.FC<AgentListViewProps> = ({ items, onReload }) => {
  return (
    <>
      <div className="cybots-grid">
        {items.map((item) => (
          <AgentBlock key={item.id} item={item} reload={onReload} />
        ))}
      </div>

      <style href="agent-list-view-styles" precedence="default">{`
        /* 
          重要说明（请勿随意修改）：
          - 默认桌面端要求每行固定显示 3 个卡片，这是产品设计约束。
          - 不要将 grid-template-columns 改为 auto-fill / auto-fit 等「自适应列数」写法。
        */
        .cybots-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr)); /* 默认每行 3 个 */
          gap: var(--space-5, 20px);
          align-items: stretch;
        }

        /* 
          响应式规则：
          - 中等屏幕（<= 1024px）降为 2 列，保证卡片阅读性。
          - 小屏（<= 600px）降为 1 列，方便纵向滚动浏览。
          - 这些仅是针对小屏的降级；默认情况依然是上面的 3 列。
        */
        @media (max-width: 1024px) {
          .cybots-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 600px) {
          .cybots-grid {
            grid-template-columns: 1fr;
            gap: var(--space-4, 16px);
          }
        }
      `}</style>
    </>
  );
};

export default AgentListView;
