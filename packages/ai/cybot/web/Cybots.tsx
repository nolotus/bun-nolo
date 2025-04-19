// ai/cybot/web/Cybots.tsx

import { memo, useEffect, useState, useCallback } from "react";
import { useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import { DataType } from "create/types";
import { useUserData } from "database/hooks/useUserData";
import { SyncIcon } from "@primer/octicons-react";
import { toast } from "react-hot-toast";
import CybotBlock from "./CybotBlock";

interface CybotsProps {
  queryUserId: string;
  limit?: number;
}

const LoadingState = memo(() => {
  const theme = useAppSelector(selectTheme);

  return (
    <div className="loading-container" style={{ color: theme.textSecondary }}>
      <SyncIcon className="icon-spin" size={16} />
      <span className="loading-text">加载 AI 列表中...</span>
    </div>
  );
});

LoadingState.displayName = "LoadingState";

const GridContainer = memo(({ children }: { children: React.ReactNode }) => (
  <div className="cybots-grid">{children}</div>
));

GridContainer.displayName = "GridContainer";

const Cybots = memo(({ queryUserId, limit = 20 }: CybotsProps) => {
  const theme = useAppSelector(selectTheme);
  const {
    loading,
    data: cybots = [],
    error,
    reload,
    clearCache,
  } = useUserData(DataType.CYBOT, queryUserId, limit);

  // 添加本地状态来管理显示的数据
  const [items, setItems] = useState(cybots);

  // 当 cybots 改变时更新本地状态
  useEffect(() => {
    setItems(cybots);
  }, [cybots]);

  // 处理删除后的重新加载
  const handleReload = useCallback(async () => {
    clearCache();
    await reload();
  }, [clearCache, reload]);

  if (error) {
    toast.error("加载AI列表失败");
    return null;
  }

  if (loading && !items.length) {
    return <LoadingState />;
  }

  if (!items.length) {
    return null;
  }

  return (
    <>
      <GridContainer>
        {items.map((item) => (
          <CybotBlock key={item.id} item={item} reload={handleReload} />
        ))}
      </GridContainer>
      <style jsx>{`
        .loading-container {
          text-align: center;
          padding: ${theme.space[6]};
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: ${theme.space[2]};
        }

        .icon-spin {
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

        .cybots-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: ${theme.space[6]};
          padding: ${theme.space[3]};
          margin: 0 auto;
          max-width: 1200px;
          width: 100%;
        }

        .loading-text {
          margin-left: ${theme.space[2]};
        }

        @media (max-width: 768px) {
          .cybots-grid {
            gap: ${theme.space[4]};
            padding: ${theme.space[2]};
          }
        }

        @media (max-width: 480px) {
          .cybots-grid {
            grid-template-columns: 1fr;
            gap: ${theme.space[3]};
          }

          .loading-container {
            padding: ${theme.space[4]};
          }
        }
      `}</style>
    </>
  );
});

Cybots.displayName = "Cybots";

export default Cybots;
