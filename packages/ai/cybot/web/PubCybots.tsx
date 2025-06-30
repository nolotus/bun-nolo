// ai/cybot/web/PubCybots.tsx

import { memo } from "react";
import { SyncIcon } from "@primer/octicons-react";
import { useAppSelector } from "app/hooks";
import { selectTheme } from "app/settings/settingSlice";
import { usePubCybots } from "ai/llm/hooks/usePubCybots";
import AgentBlock from "ai/llm/web/AgentBlock";
import toast from "react-hot-toast";

interface PubCybotsProps {
  limit?: number;
  showEmpty?: boolean; // 是否显示空状态
}

const LoadingState = memo(() => {
  const theme = useAppSelector(selectTheme);

  return (
    <div className="loading-container">
      <SyncIcon className="icon-spin" size={16} />
      <span>加载AI列表中...</span>
      <style jsx>{`
        .loading-container {
          text-align: center;
          padding: 1.5rem;
          color: ${theme.textSecondary};
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        :global(.icon-spin) {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
});

LoadingState.displayName = "LoadingState";

const EmptyState = memo(() => {
  const theme = useAppSelector(selectTheme);

  return (
    <div className="empty-state">
      暂无公开的AI助手
      <style jsx>{`
        .empty-state {
          text-align: center;
          padding: 1.5rem;
          color: ${theme.textSecondary};
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
});

EmptyState.displayName = "EmptyState";

const PubCybots = memo(({ limit = 20, showEmpty = true }: PubCybotsProps) => {
  const theme = useAppSelector(selectTheme);
  const { loading, error, data } = usePubCybots({
    limit,
    sortBy: "newest",
  });

  if (error) {
    toast.error("加载AI列表失败");
    return null;
  }

  // 只在完全没有数据时显示加载状态
  if (loading && !data.length) {
    return <LoadingState />;
  }

  if (!data.length && showEmpty) {
    return <EmptyState />;
  }

  return (
    <>
      <div className={`cybots-grid `}>
        {data.map((item) => (
          <AgentBlock key={item.id} item={item} />
        ))}
      </div>
      <style>{`
        .cybots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
          padding: 0.5rem;
        }

        @media (max-width: 768px) {
          .cybots-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          }
        }

        @media (max-width: 480px) {
          .cybots-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
});

PubCybots.displayName = "PubCybots";

export default PubCybots;
