import { useAppDispatch, useAppSelector } from 'app/hooks';
import { DataType } from 'create/types';
import React from 'react';
import { Card, Select } from 'ui';

import { setFilterType, setUserIdFilter } from '../lifeSlice';
import {
  selectFilterType,
  selectUserIdFilter,
  selectFilteredLifeData,
} from '../selectors';

export const FilterPanel = () => {
  const dispatch = useAppDispatch();
  const filterType = useAppSelector(selectFilterType);
  const userIdFilter = useAppSelector(selectUserIdFilter);
  const filteredData = useAppSelector(selectFilteredLifeData);

  const handleFilterTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    dispatch(setFilterType(event.target.value));
  };

  const handleUserIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setUserIdFilter(event.target.value));
  };

  return (
    <Card className="my-2">
      <div className="flex gap-6 p-4 border-b items-center">
        <div className="flex items-center gap-4">
          <label
            htmlFor="filterType"
            className="text-sm font-medium text-gray-700"
          >
            Filter Type:
          </label>
          <Select
            id="filterType"
            value={filterType}
            onChange={handleFilterTypeChange}
            options={Object.values(DataType)}
            placeholder="Select a filter type"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label
            htmlFor="userIdFilter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            User ID Filter:
          </label>
          <input
            id="userIdFilter"
            value={userIdFilter}
            onChange={handleUserIdChange}
            placeholder="Enter User ID"
            className="block w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      <div className="p-4">
        <span className="text-sm font-medium text-gray-700">
          Data Count: {filteredData.length}
        </span>
      </div>
    </Card>
  );
};
