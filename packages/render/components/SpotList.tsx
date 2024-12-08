import { SpotCard } from "render/components/SpotCard";

import { useQueryData } from "app/hooks/useQueryData";

import { DataType } from "create/types";
import { Spinner } from "@primer/react";
import React from "react";
import { layout } from "../styles/layout";
import { sizes } from "../styles/sizes";
export const SpotList = ({ userId }) => {
  const queryConfig = {
    queryUserId: userId,
    options: {
      isJSON: true,
      condition: {
        type: DataType.SurfSpot,
      },
      limit: 20,
    },
  };
  const { data, isSuccess, isLoading, error } = useQueryData(queryConfig);
  if (isLoading) {
    return <Spinner />;
  }
  const filteredSpots = data?.filter((spot) => !spot.is_template) || [];

  return (
    <div style={{ gap: sizes.size4, ...layout.flexWrap, ...layout.flex }}>
      {filteredSpots.map((spot) => (
        <SpotCard key={spot.id} data={spot} />
      ))}
    </div>
  );
};
