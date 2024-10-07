// Cybots.tsx
import React from "react";
import { useQueryData } from "app/hooks";
import { DataType } from "create/types";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";
import { styles } from "render/ui/styles";

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

  const combinedStyles = {
    loadingText: {
      ...styles.textCenter,
      ...styles.py2,
      color: theme.text2,
    },
    responsiveContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
      gap: theme.spacing.medium,
      padding: theme.spacing.large,
    },
    responsiveItem: {
      width: "100%",
    },
  };

  if (isLoading && isLoading2) {
    return <div style={combinedStyles.loadingText}>加载 AI 列表中...</div>;
  }

  return (
    <div style={combinedStyles.responsiveContainer}>
      {isSuccess &&
        data?.map((item) => (
          <div key={item.id} style={combinedStyles.responsiveItem}>
            <CybotBlock item={item} />
          </div>
        ))}
      {isSuccess2 &&
        data2?.map((item) => (
          <div key={item.id} style={combinedStyles.responsiveItem}>
            <CybotBlock item={item} />
          </div>
        ))}
    </div>
  );
};

export default Cybots;
