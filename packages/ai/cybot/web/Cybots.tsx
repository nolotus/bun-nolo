// ai/cybots/Cybots.tsx
import { memo, useEffect, useState } from "react";
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
  closeModal?: () => void;
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

const Cybots = memo(({ queryUserId, limit = 20, closeModal }: CybotsProps) => {
  const {
    loading,
    data: cybots = [],
    error,
    reload,
  } = useUserData(DataType.CYBOT, queryUserId, limit);

  // 添加本地状态管理
  const [items, setItems] = useState(cybots);

  // 当cybots改变时更新本地状态
  useEffect(() => {
    setItems(cybots);
  }, [cybots]);

  // 处理删除回调
  const handleDelete = (deletedId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== deletedId));
  };

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
      <style>
        {`
          .loading-container {
            text-align: center;
            padding: 1.5rem;
            font-size: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
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
            gap: 1.5rem;
            padding: 0.8rem;
            margin: 0 auto;
            max-width: 1200px;
          }

          .loading-text {
            margin-left: 0.5rem;
          }

          /* 添加网格项的进入动画 */
          .cybots-grid > * {
            animation: itemEnter 0.3s ease-out;
          }

          @keyframes itemEnter {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
      <GridContainer>
        {items.map((item) => (
          <CybotBlock
            key={item.id}
            item={item}
            closeModal={closeModal}
            reload={reload}
            onDelete={handleDelete}
          />
        ))}
      </GridContainer>
    </>
  );
});

Cybots.displayName = "Cybots";

export default Cybots;
