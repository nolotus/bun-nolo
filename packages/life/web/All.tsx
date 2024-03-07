import { useAppSelector } from "app/hooks";
import React from "react";
import { NoteIcon, ProjectIcon } from "@primer/octicons-react";
import { AccountBalance } from "../blocks/AccountBanlance";
import DataList from "../blocks/DataList";
import { FilterPanel } from "../blocks/FilterPanel";
import { useFetchData } from "../hooks/useFetchData";
import { selectFilteredLifeData } from "../selectors";
export const LifeAll = () => {
  const { fetchData } = useFetchData();
  const data = useAppSelector(selectFilteredLifeData);

  return (
    <div className="p-4">
      <AccountBalance />
      <div className="flex justify-between">
        <FilterPanel />
        <div>
          试图切换
          <ProjectIcon size={24} />
          <NoteIcon size={24} />
        </div>
      </div>

      <DataList data={data} refreshData={fetchData} />
    </div>
  );
};

export default LifeAll;
