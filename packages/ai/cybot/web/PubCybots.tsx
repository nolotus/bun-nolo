// ai/cybot/web/PubCybots.tsx - 针对 MainLayout 优化

import { memo } from "react";
import { SyncIcon } from "@primer/octicons-react";
import { usePubCybots } from "ai/llm/hooks/usePubCybots";
import AgentBlock from "ai/agent/web/AgentBlock";
import toast from "react-hot-toast";

interface PubCybotsProps {
  limit?: number;
  showEmpty?: boolean;
}

const LoadingState = memo(() => {
  return (
    <div className="loading-container">
      <SyncIcon className="loading-icon" size={24} />
      <span className="loading-text">发现更多AI助手中...</span>
      <style href="pub-cybots-loading" precedence="default">{`
        .loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-4);
          padding: var(--space-20) var(--space-6);
          color: var(--textSecondary);
          font-size: 1rem;
          font-weight: 400;
        }

        :global(.loading-icon) {
          color: var(--primary);
          animation: spin 1.2s linear infinite;
        }

        .loading-text {
          letter-spacing: 0.01em;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
});

LoadingState.displayName = "LoadingState";

const EmptyState = memo(() => {
  return (
    <div className="empty-state">
      <div className="empty-content">
        <div className="empty-icon">🤖</div>
        <div className="empty-title">暂无公开的AI助手</div>
        <div className="empty-description">
          稍后再来看看，或许会有新的AI助手加入
        </div>
      </div>
      <style href="pub-cybots-empty" precedence="default">{`
        .empty-state {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-24) var(--space-6);
          min-height: 300px;
        }

        .empty-content {
          text-align: center;
          max-width: 320px;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: var(--space-5);
          opacity: 0.6;
        }

        .empty-title {
          color: var(--textSecondary);
          font-size: 1.125rem;
          font-weight: 500;
          margin-bottom: var(--space-3);
          letter-spacing: -0.01em;
        }

        .empty-description {
          color: var(--textTertiary);
          font-size: 0.9rem;
          line-height: 1.6;
          font-weight: 400;
        }
      `}</style>
    </div>
  );
});

EmptyState.displayName = "EmptyState";

const PubCybots = memo(({ limit = 20, showEmpty = true }: PubCybotsProps) => {
  const { loading, error, data } = usePubCybots({
    limit,
    sortBy: "newest",
  });

  if (error) {
    toast.error("加载AI列表失败，请稍后重试");
    return null;
  }

  if (loading && !data.length) {
    return <LoadingState />;
  }

  if (!data.length && showEmpty) {
    return <EmptyState />;
  }

  return (
    <div className="cybots-container">
      <div className="cybots-grid">
        {data.map((item) => (
          <AgentBlock key={item.id} item={item} />
        ))}
      </div>
      {loading && data.length > 0 && (
        <div className="loading-more">
          <SyncIcon className="loading-more-icon" size={16} />
          <span>加载更多中...</span>
        </div>
      )}
      <style href="pub-cybots-grid" precedence="default">{`
        .cybots-container {
          width: 100%;
        }

        .cybots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: var(--space-6);
          padding: var(--space-2);
        }

        .loading-more {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-3);
          padding: var(--space-8);
          color: var(--textTertiary);
          font-size: 0.9rem;
          margin-top: var(--space-6);
          border-top: 1px solid var(--borderLight);
        }

        :global(.loading-more-icon) {
          animation: spin 1s linear infinite;
          color: var(--primary);
        }

        /* 针对 MainLayout 的响应式优化 */
        @media (max-width: 1400px) {
          .cybots-grid {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          }
        }

        @media (max-width: 1200px) {
          .cybots-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: var(--space-5);
          }
        }

        @media (max-width: 768px) {
          .cybots-grid {
            grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
            gap: var(--space-4);
            padding: 0;
          }
          
          .loading-more {
            padding: var(--space-6);
          }
        }

        @media (max-width: 600px) {
          .cybots-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          }
        }

        @media (max-width: 520px) {
          .cybots-grid {
            grid-template-columns: 1fr;
            gap: var(--space-4);
          }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
});

PubCybots.displayName = "PubCybots";

export default PubCybots;
