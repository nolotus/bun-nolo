import React from "react";
import {
  NoteIcon,
  ProjectIcon,
  ListUnorderedIcon,
  TagIcon,
} from "@primer/octicons-react";
import { Card, Select } from "ui";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { DataType } from "create/types";
import { useSearchParams } from "react-router-dom";

import { AccountBalance } from "../blocks/AccountBanlance";
import DataList from "../blocks/DataList";
import { FilterPanel } from "../blocks/FilterPanel";
import { useFetchData } from "../hooks/useFetchData";
import { selectFilteredLifeData } from "../selectors";
import { selectFilterType } from "../selectors";
import { setFilterType } from "../lifeSlice";

export const LifeAll = () => {
  const dispatch = useAppDispatch();
  const filterType = useAppSelector(selectFilterType);
  let [searchParams, setSearchParams] = useSearchParams();

  const { fetchData } = useFetchData();
  const data = useAppSelector(selectFilteredLifeData);
  const handleFilterTypeChange = (chooseDataType) => {
    dispatch(setFilterType(chooseDataType));
    setSearchParams({ filterType: chooseDataType });
  };
  const typeArray = Object.values(DataType);
  return (
    <div className="p-4">
      <AccountBalance />
      <div className="flex gap-2">
        {typeArray.map((typeItem) => {
          return (
            <div
              onClick={() => {
                handleFilterTypeChange(typeItem);
              }}
              className=""
            >
              {typeItem}
            </div>
          );
        })}
      </div>
      <div className="flex justify-between">
        <FilterPanel />
        <div>
          标签选择
          <TagIcon size={24} />
        </div>
        <div>
          视图切换
          <ProjectIcon size={24} />
          <NoteIcon size={24} />
          <ListUnorderedIcon size={24} />
        </div>
      </div>

      <DataList data={data} refreshData={fetchData} />
    </div>
  );
};

export default LifeAll;
