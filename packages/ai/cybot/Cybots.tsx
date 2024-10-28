import React from "react";
import { useQueryData } from "app/hooks/useQueryData";

import { DataType } from "create/types";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";
import { styles } from "render/ui/styles";
import { selectFilteredDataByUserAndType } from "database/selectors";
import { useAppSelector } from "app/hooks";

import CybotBlock from "./CybotBlock";

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
  const theme = useSelector(selectTheme);

  const queryConfig = {
    queryUserId,
    options: {
      isJSON: true,
      limit,
      condition: {
        type: DataType.ChatRobot,
      },
    },
  };
  const { isLoading, isSuccess } = useQueryData(queryConfig);

  const queryConfig2 = {
    queryUserId,
    options: {
      isJSON: true,
      limit,
      condition: {
        type: DataType.Cybot,
      },
    },
  };
  const { isLoading: isLoading2, isSuccess: isSuccess2 } =
    useQueryData(queryConfig2);
  const data = useAppSelector(
    selectFilteredDataByUserAndType(queryUserId, DataType.ChatRobot),
  );
  const data2 = useAppSelector(
    selectFilteredDataByUserAndType(queryUserId, DataType.Cybot),
  );

  if (isLoading && isLoading2) {
    return (
      <div style={{ ...styles.textCenter, ...styles.py2, color: theme.text2 }}>
        加载 AI 列表中...
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: theme.spacing.small,
        padding: theme.spacing.medium,
      }}
    >
      {isSuccess &&
        data?.map((item) => (
          <div key={item.id} style={styles.w100}>
            <CybotBlock item={item} closeModal={closeModal} />
          </div>
        ))}
      {isSuccess2 &&
        data2?.map((item) => (
          <div key={item.id} style={styles.w100}>
            <CybotBlock item={item} closeModal={closeModal} />
          </div>
        ))}
    </div>
  );
};

export default Cybots;
