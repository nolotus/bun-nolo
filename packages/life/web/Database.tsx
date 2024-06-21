import {
  NoteIcon,
  ProjectIcon,
  ListUnorderedIcon,
  TagIcon,
} from "@primer/octicons-react";
import { useAppDispatch, useAppSelector, useQueryData } from "app/hooks";
import { useSearchParams } from "react-router-dom";
import React, { useEffect, useState } from "react";

import { AccountBalance } from "../blocks/AccountBanlance";
import DataDisplay from "../blocks/DataDisplay";
import { FilterPanel } from "../blocks/FilterPanel";
import { TypeChange } from "./typeChange";
import { selectFilteredDataByUserAndType } from "database/selectors";
import { selectCurrentUserId } from "auth/authSlice";
import { DataType } from "create/types";

const typeArray = ["All", ...Object.values(DataType)];

export const Database = () => {
  const mainColor = useAppSelector((state) => state.theme.mainColor);

  const dispatch = useAppDispatch();
  let [searchParams, setSearchParams] = useSearchParams();

  const [type, setType] = useState(searchParams.get("type"));
  const currentUserId = useAppSelector(selectCurrentUserId);

  const data = useAppSelector(
    selectFilteredDataByUserAndType(currentUserId, type),
  );

  const queryConfig = {
    queryUserId: currentUserId,
    options: {
      isJSON: true,
      limit: 100,
      condition: {},
    },
  };
  if (type) {
    queryConfig.options.condition.type = type;
  }
  const { isLoading } = useQueryData(queryConfig);
  const [viewMode, setViewMdoe] = useState("table");

  const changeType = (type) => {
    if (type === "All") {
      console.log("type", type);
      setSearchParams({});
      setType(null);
    } else {
      setType(type);
      setSearchParams({ type });
    }
  };

  return (
    <div className="p-4">
      {/* <AccountBalance /> */}
      {/* <TypeChange /> */}
      <div className="flex justify-between">
        {/* <FilterPanel /> */}
        {/* <div>
          标签选择
          <TagIcon size={24} />
        </div> */}
      </div>
      <div className="flex justify-between">
        <div className="flex w-3/5 gap-2 overflow-auto">
          {typeArray.map((typeItem) => {
            const isActive = type === typeItem || (typeItem === "All" && !type);
            return (
              <div
                key={typeItem}
                onClick={() => changeType(typeItem)}
                className="relative flex cursor-pointer items-center justify-center p-2 transition-all duration-200 hover:bg-blue-100"
                style={
                  isActive
                    ? {
                        borderBottom: "3px solid",
                        borderBottomColor: mainColor,
                      }
                    : undefined
                }
              >
                {typeItem}
              </div>
            );
          })}
        </div>
        <div className="w-1/5">
          视图切换
          <ProjectIcon size={24} />
          <NoteIcon size={24} />
          <ListUnorderedIcon size={24} />
        </div>
      </div>

      <DataDisplay data={data} type={type} viewMode={viewMode} />
    </div>
  );
};

export default Database;
