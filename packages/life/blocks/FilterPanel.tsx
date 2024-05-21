import { useAppDispatch } from "app/hooks";
import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, Select } from "ui";
import { SortDescIcon } from "@primer/octicons-react";
import { setSortKey, setSortOrder } from "../lifeSlice";

export const FilterPanel = () => {
  const dispatch = useAppDispatch();
  let [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    dispatch(setSortKey(searchParams.get("sortKey") || ""));
    dispatch(setSortOrder(searchParams.get("sortOrder") || ""));
  }, []);

  const handleSortKeyChange = (event) => {
    dispatch(setSortKey(event.target.value));
    setSearchParams({ sortKey: event.target.value });
  };

  const handleSortOrderChange = (event) => {
    dispatch(setSortOrder(event.target.value));
    setSearchParams({ sortOrder: event.target.value });
  };

  return (
    <Card className="my-4 p-4">
      <div className="flex gap-4">
        <div className="flex flex-col gap-2">
          <label
            htmlFor="sortKey"
            className="text-sm font-medium text-gray-700"
          >
            Sort Key:
          </label>
          <input
            id="sortKey"
            onChange={handleSortKeyChange}
            placeholder="Enter key to sort"
            className="w-full rounded border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            <SortDescIcon size={24} />
            {/* <SortAscIcon size={24} /> */}
            Sort Order:
          </label>
          <Select
            id="sortOrder"
            onChange={handleSortOrderChange}
            options={["asc", "desc"]}
            placeholder="Select sort order"
          />
        </div>
      </div>
    </Card>
  );
};
