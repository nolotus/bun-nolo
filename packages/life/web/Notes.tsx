import { useAppSelector } from "app/hooks";
import React from "react";
import { selectCurrentUserId } from "auth/authSlice";
import { DataType } from "create/types";

import { FilterPanel } from "./FilterPanel";
import DataDisplay from "../blocks/DataDisplay";
import { selectFilteredDataByUserAndType } from "database/selectors";

export const Notes = () => {
  const currentUserId = useAppSelector(selectCurrentUserId);

  const data = useAppSelector(
    selectFilteredDataByUserAndType(currentUserId, DataType.Page),
  );
  return (
    <div className="p-4">
      <FilterPanel />
      <DataDisplay data={data} />
    </div>
  );
};

export default Notes;
