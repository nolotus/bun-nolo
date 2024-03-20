import {
  NoteIcon,
  ProjectIcon,
  ListUnorderedIcon,
  TagIcon,
} from "@primer/octicons-react";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { DataType } from "create/types";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";

import { AccountBalance } from "../blocks/AccountBanlance";
import DataList from "../blocks/DataList";
import { FilterPanel } from "../blocks/FilterPanel";
import { selectFilteredLifeData } from "../selectors";
import { selectFilterType } from "../selectors";
import { setFilterType } from "../lifeSlice";
import { updateData } from "database/dbSlice";
import { getDomains } from "app/domains";

export const LifeAll = () => {
  const dispatch = useAppDispatch();
  const filterType = useAppSelector(selectFilterType);
  let [searchParams, setSearchParams] = useSearchParams();
  console.log("searchParams", searchParams);

  const mainColor = useSelector((state: any) => state.theme.mainColor);
  const domains = getDomains();
  console.log("domains", domains);
  const fetchData = async (userId: string) => {
    domains.forEach(async ({ domain, source }) => {
      const result = await trigger({ userId, domain }).unwrap();
      dispatch(updateData({ data: result, source }));
    });
  };

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
          const isActive = filterType === typeItem;
          return (
            <div
              key={typeItem}
              onClick={() => handleFilterTypeChange(typeItem)}
              className="relative flex cursor-pointer items-center justify-center p-2 transition-all duration-200 hover:bg-blue-100"
              style={
                isActive
                  ? { borderBottom: "3px solid", borderBottomColor: mainColor }
                  : undefined
              }
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
