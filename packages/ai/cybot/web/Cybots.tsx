import type React from "react";
import { useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import { DataType } from "create/types";
import CybotBlock from "./CybotBlock";
import { useUserData } from "database/hooks/useUserData";
import { selectByType } from "database/dbSlice";

interface CybotsProps {
  queryUserId: string;
  limit?: number;
  closeModal?: () => void;
}

const Cybots: React.FC<CybotsProps> = ({
  queryUserId,
  limit = 20,
  closeModal,
}) => {
  const theme = useAppSelector(selectTheme);
  const cybots = useAppSelector((state) =>
    selectByType(state, DataType.CYBOT, queryUserId)
  );

  const { loading, reload } = useUserData(DataType.CYBOT, queryUserId, limit);

  const styles = {
    loadingContainer: {
      textAlign: "center" as const,
      padding: "1.5rem",
      color: theme.textSecondary,
      fontSize: "1rem",
    },
    gridContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
      gap: "1.5rem",
      padding: "0.8rem",
      margin: "0 auto",
      maxWidth: "1200px",
    },
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="fadeIn">加载 AI 列表中...</div>
      </div>
    );
  }

  if (!cybots?.length) return null;

  return (
    <div className="fadeIn" style={styles.gridContainer}>
      {cybots.map((item) => (
        <div key={item.id} className="slideInUp">
          <CybotBlock item={item} closeModal={closeModal} reload={reload} />
        </div>
      ))}
    </div>
  );
};

export default Cybots;
