// Cybots.tsx
import React from "react";
import styled from "styled-components";
import { useQueryData } from "app/hooks";
import { DataType } from "create/types";
import {
  ResponsiveContainer,
  ResponsiveItem,
} from "render/styles/ResponsiveGrid";

import CybotBlock from "./CybotBlock";

const LoadingText = styled.div`
  text-align: center;
  padding: 1rem 0;
  color: ${(props) => props.theme.text2};
`;

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

  if (isLoading && isLoading2) {
    return <LoadingText>加载 AI 列表中...</LoadingText>;
  }

  return (
    <ResponsiveContainer>
      {isSuccess &&
        data?.map((item) => (
          <ResponsiveItem key={item.id}>
            <CybotBlock item={item} />
          </ResponsiveItem>
        ))}
      {isSuccess2 &&
        data2?.map((item) => (
          <ResponsiveItem key={item.id}>
            <CybotBlock item={item} />
          </ResponsiveItem>
        ))}
    </ResponsiveContainer>
  );
};

export default Cybots;
