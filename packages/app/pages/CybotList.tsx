// file: src/pages/CybotList.tsx
import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { LuBot } from "react-icons/lu";
import { useUserData } from "database/hooks/useUserData";
import AgentBlock from "ai/agent/web/AgentBlock";
import { DataType } from "create/types";

type CybotListProps = {
  queryUserId: string | null;
  limit?: number;
};

const LoadingShimmer = () => (
  <div className="cybots-grid">
    {Array.from({ length: 6 }, (_, i) => (
      <div key={i} className="loading-card-container">
        <div className="loading-card" />
      </div>
    ))}
  </div>
);

const EmptyPlaceholder = ({ message }: { message: string }) => (
  <div className="empty-container">
    <div className="empty-icon-wrapper">
      <LuBot size={40} />
    </div>
    <p className="empty-text">{message}</p>
  </div>
);

const CybotList: React.FC<CybotListProps> = ({ queryUserId, limit = 9 }) => {
  const {
    loading,
    data: cybots = [],
    error,
    reload,
    clearCache,
  } = useUserData(DataType.CYBOT, queryUserId, limit);
  const [items, setItems] = useState(cybots);

  useEffect(() => setItems(cybots), [cybots]);

  useEffect(() => {
    if (error) toast.error("加载失败");
  }, [error]);

  const handleReload = useCallback(async () => {
    clearCache();
    await reload();
  }, [clearCache, reload]);

  if (loading && !items.length) return <LoadingShimmer />;
  if (!items.length) return <EmptyPlaceholder message="还没有创建 AI 助手" />;

  return (
    <>
      <div className="cybots-grid">
        {items.map((item) => (
          <AgentBlock key={item.id} item={item} reload={handleReload} />
        ))}
      </div>

      <style href="cybot-list" precedence="high">{`
        .cybots-grid { 
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
        }

        .cybots-grid > * {
          flex: 1 1 300px;
          max-width: 100%;
        }

        .loading-card-container {
          border-radius: 16px;
          height: 200px;
          background: var(--background);
          border: 1px solid var(--borderLight);
          padding: 20px;
        }

        .loading-card { 
          width: 100%;
          height: 100%;
          border-radius: 12px; 
          background: linear-gradient(
            90deg,
            var(--backgroundSecondary) 25%,
            var(--background) 50%,
            var(--backgroundSecondary) 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer { 
          0% { background-position: 200% 0; } 
          100% { background-position: -200% 0; } 
        }

        .empty-container { 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          justify-content: center; 
          gap: 16px; 
          min-height: 300px; 
          color: var(--textTertiary); 
          text-align: center;
          background: var(--backgroundSecondary);
          border-radius: var(--card-radius);
          border: 1px dashed var(--border);
        }

        .empty-icon-wrapper { 
          width: 72px; 
          height: 72px; 
          border-radius: 24px; 
          background: var(--background); 
          color: var(--textQuaternary); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          box-shadow: var(--card-shadow-sm);
        }

        .empty-text { 
          font-size: 0.95rem; 
          font-weight: 500; 
          margin: 0; 
        }

        @media (max-width: 768px) {
          .cybots-grid {
            flex-direction: column;
            gap: 16px;
          }

          .cybots-grid > * {
            flex: 1 1 100%;
          }
        }
      `}</style>
    </>
  );
};

export default CybotList;
