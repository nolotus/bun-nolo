// components/cybots/Cybots.tsx
import { memo } from "react";
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

  if (error) {
    toast.error("加载AI列表失败");
    return null;
  }

  if (loading && !cybots.length) {
    return <LoadingState />;
  }

  if (!cybots.length) {
    return null;
  }

  const handleReload = async () => {
    try {
      await reload();
    } catch (err) {
      toast.error("刷新失败，请稍后重试");
    }
  };

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
        `}
      </style>
      <GridContainer>
        {cybots.map((item) => (
          <CybotBlock
            key={item.id}
            item={item}
            closeModal={closeModal}
            reload={handleReload}
          />
        ))}
      </GridContainer>
    </>
  );
});

Cybots.displayName = "Cybots";

export default Cybots;
