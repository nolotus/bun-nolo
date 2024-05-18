import {
  NoteIcon,
  ProjectIcon,
  ListUnorderedIcon,
  TagIcon,
} from "@primer/octicons-react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { useSearchParams } from "react-router-dom";
import React, { useEffect } from "react";
import { updateData } from "database/dbSlice";
import { getDomains } from "app/domains";

import { AccountBalance } from "../blocks/AccountBanlance";
import DataList from "../blocks/DataList";
import { FilterPanel } from "../blocks/FilterPanel";
import { selectFilteredLifeData } from "../selectors";
import { setFilterType } from "../lifeSlice";
import { TypeChange } from "./typeChange";

export const Database = () => {
  const dispatch = useAppDispatch();
  let [searchParams] = useSearchParams();

  const domains = getDomains();
  const fetchData = async (userId: string) => {
    domains.forEach(async ({ domain, source }) => {
      const result = await trigger({ userId, domain }).unwrap();
      dispatch(updateData({ data: result, source }));
    });
  };

  const data = useAppSelector(selectFilteredLifeData);

  useEffect(() => {
    dispatch(setFilterType(searchParams.get("filterType") || ""));
  }, []);
  return (
    <div className="p-4">
      <AccountBalance />
      <TypeChange />
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

export default Database;
