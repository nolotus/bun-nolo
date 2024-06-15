import {
  NoteIcon,
  ProjectIcon,
  ListUnorderedIcon,
  TagIcon,
} from "@primer/octicons-react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { useSearchParams } from "react-router-dom";
import React, { useEffect, useState } from "react";

import { AccountBalance } from "../blocks/AccountBanlance";
import DataDisplay from "../blocks/DataDisplay";
import { FilterPanel } from "../blocks/FilterPanel";
import { selectFilteredLifeData } from "../selectors";
import { TypeChange } from "./typeChange";

export const LifeAll = () => {
  const dispatch = useAppDispatch();
  let [searchParams] = useSearchParams();
  const [viewMode, setViewMdoe] = useState("table");

  const data = useAppSelector(selectFilteredLifeData);

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

      <DataDisplay data={data} />
    </div>
  );
};

export default LifeAll;
