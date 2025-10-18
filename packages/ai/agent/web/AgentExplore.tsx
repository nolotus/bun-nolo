// AgentExplore 页面 - 针对 MainLayout 优化
import React from "react";
// 1. 导入新的 PublicAgents 组件
import PublicAgents from "ai/agent/web/PublicAgents";

const AgentExplore: React.FC = () => {
  return (
    // 2. 更新根 div 的 className
    <div className="agent-explore">
      <div className="agent-explore-header">
        <h1 className="agent-explore-title">AI广场</h1>
        <p className="agent-explore-subtitle">发现并探索更多智能助手</p>
      </div>
      <div className="agent-explore-content">
        {/* 3. 使用新的 PublicAgents 组件 */}
        <PublicAgents limit={100} />
      </div>
      {/* 4. 更新 style 标签的 href 和所有 CSS 类名 */}
      <style href="agent-explore-styles" precedence="default">{`
        .agent-explore {
          padding: var(--space-8) var(--space-8);
          max-width: 1400px;
          margin: 0 auto;
          min-height: 100%;
          background: var(--backgroundSecondary);
        }

        .agent-explore-header {
          margin-bottom: var(--space-8);
          text-align: center;
        }

        .agent-explore-title {
          font-size: 2.25rem;
          font-weight: 600;
          color: var(--text);
          margin: 0 0 var(--space-3) 0;
          letter-spacing: -0.03em;
        }

        .agent-explore-subtitle {
          font-size: 1.1rem;
          color: var(--textSecondary);
          margin: 0;
          font-weight: 400;
          letter-spacing: -0.01em;
        }

        .agent-explore-content {
          background: var(--background);
          border-radius: 16px;
          padding: var(--space-8);
          box-shadow: var(--shadowLight);
          border: 1px solid var(--borderLight);
        }

        /* 适配 MainLayout 的响应式 */
        @media (max-width: 1200px) {
          .agent-explore {
            padding: var(--space-6) var(--space-6);
            max-width: none;
          }
          
          .agent-explore-content {
            padding: var(--space-6);
          }
        }

        @media (max-width: 768px) {
          .agent-explore {
            padding: var(--space-4) var(--space-4);
          }
          
          .agent-explore-title {
            font-size: 1.75rem;
          }
          
          .agent-explore-subtitle {
            font-size: 1rem;
          }
          
          .agent-explore-content {
            padding: var(--space-4);
            border-radius: 12px;
          }
        }

        @media (max-width: 480px) {
          .agent-explore {
            padding: var(--space-3) var(--space-3);
          }
          
          .agent-explore-content {
            padding: var(--space-3);
            border-radius: 8px;
          }
        }
      `}</style>
    </div>
  );
};

// 5. 更新导出
export default AgentExplore;
