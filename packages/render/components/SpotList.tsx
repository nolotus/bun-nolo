import { SpotCard } from "render/components/SpotCard";
import OpenProps from "open-props";

import { useQueryData } from "app/hooks/useQueryData";

import { DataType } from "create/types";
import { Spinner } from "@primer/react";
import React from "react";
export const SpotList = ({ userId }) => {
  const options = {
    isJSON: true,
    condition: {
      type: DataType.SurfSpot,
    },
    limit: 20,
  };

  const queryConfig = {
    queryUserId: userId,
    options,
  };
  const { data, isSuccess, isLoading, error } = useQueryData(queryConfig);
  if (isLoading) {
    return <Spinner />;
  }
  const filteredSpots = data?.filter((spot) => !spot.is_template) || [];

  return (
    <div style={{ display: "flex", gap: OpenProps.size4, flexWrap: "wrap" }}>
      {filteredSpots.map((spot) => (
        <SpotCard key={spot.id} data={spot} />
      ))}
    </div>
  );
};
