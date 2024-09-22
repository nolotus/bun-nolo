// Cybots.tsx
import React from "react";
import { useQueryData } from "app/hooks";
import { DataType } from "create/types";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";
import CybotBlock from "./CybotBlock";

interface CybotsProps {
  queryUserId: string;
  limit?: number;
}

interface QueryConfig {
  queryUserId: string;
  options: {
    isJSON: boolean;
    limit: number;
    condition: {
      type: DataType;
    };
  };
}

const Cybots: React.FC<CybotsProps> = ({ queryUserId, limit = 20 }) => {
  const theme = useSelector(selectTheme);

  const queryConfig: QueryConfig = {
    queryUserId,
    options: {
      isJSON: true,
      limit,
      condition: {
        type: DataType.ChatRobot,
      },
    },
  };
  const queryConfig2: QueryConfig = {
    queryUserId,
    options: {
      isJSON: true,
      limit,
      condition: {
        type: DataType.Cybot,
      },
    },
  };

  const { data, isLoading, isSuccess } = useQueryData(queryConfig);
  const {
    data: data2,
    isLoading: isLoading2,
    isSuccess: isSuccess2,
  } = useQueryData(queryConfig2);

  const styles = {
    loadingText: {
      textAlign: "center",
      padding: "1rem 0",
      color: theme.text2,
    },
    responsiveContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
      gap: "1rem",
      padding: "1rem",
    },
    responsiveItem: {
      width: "100%",
    },
  };

  if (isLoading && isLoading2) {
    return <div style={styles.loadingText}>加载 AI 列表中...</div>;
  }

  return (
    <div style={styles.responsiveContainer}>
      {isSuccess &&
        data?.map((item) => (
          <div key={item.id} style={styles.responsiveItem}>
            <CybotBlock item={item} />
          </div>
        ))}
      {isSuccess2 &&
        data2?.map((item) => (
          <div key={item.id} style={styles.responsiveItem}>
            <CybotBlock item={item} />
          </div>
        ))}
    </div>
  );
};

export default Cybots;
