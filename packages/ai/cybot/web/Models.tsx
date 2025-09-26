// Models 页面 - 针对 MainLayout 优化
import React from "react";
import PubCybots from "ai/cybot/web/PubCybots";

const Models: React.FC = () => {
  return (
    <div className="ai-plaza">
      <div className="ai-plaza-header">
        <h1 className="ai-plaza-title">AI广场</h1>
        <p className="ai-plaza-subtitle">发现并探索更多智能助手</p>
      </div>
      <div className="ai-plaza-content">
        <PubCybots limit={100} />
      </div>
      <style href="ai-plaza-styles" precedence="default">{`
        .ai-plaza {
          padding: var(--space-8) var(--space-8);
          max-width: 1400px;
          margin: 0 auto;
          min-height: 100%;
          background: var(--backgroundSecondary);
        }

        .ai-plaza-header {
          margin-bottom: var(--space-8);
          text-align: center;
        }

        .ai-plaza-title {
          font-size: 2.25rem;
          font-weight: 600;
          color: var(--text);
          margin: 0 0 var(--space-3) 0;
          letter-spacing: -0.03em;
        }

        .ai-plaza-subtitle {
          font-size: 1.1rem;
          color: var(--textSecondary);
          margin: 0;
          font-weight: 400;
          letter-spacing: -0.01em;
        }

        .ai-plaza-content {
          background: var(--background);
          border-radius: 16px;
          padding: var(--space-8);
          box-shadow: var(--shadowLight);
          border: 1px solid var(--borderLight);
        }

        /* 适配 MainLayout 的响应式 */
        @media (max-width: 1200px) {
          .ai-plaza {
            padding: var(--space-6) var(--space-6);
            max-width: none;
          }
          
          .ai-plaza-content {
            padding: var(--space-6);
          }
        }

        @media (max-width: 768px) {
          .ai-plaza {
            padding: var(--space-4) var(--space-4);
          }
          
          .ai-plaza-title {
            font-size: 1.75rem;
          }
          
          .ai-plaza-subtitle {
            font-size: 1rem;
          }
          
          .ai-plaza-content {
            padding: var(--space-4);
            border-radius: 12px;
          }
        }

        @media (max-width: 480px) {
          .ai-plaza {
            padding: var(--space-3) var(--space-3);
          }
          
          .ai-plaza-content {
            padding: var(--space-3);
            border-radius: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default Models;
