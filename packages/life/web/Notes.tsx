import { useAppSelector } from "app/hooks";
import { selectPages } from "database/selectors";
import React from "react";

import { FilterPanel } from "./FilterPanel";
import { useFetchData } from "../hooks/useFetchData";
import DataList from "../blocks/DataList";
export const Notes = () => {
  const data = useAppSelector(selectPages);
  const { fetchData } = useFetchData();

  return (
    <div className="p-4">
      <FilterPanel />
      <DataList data={data} refreshData={fetchData} />
    </div>
  );
};

export default Notes;
