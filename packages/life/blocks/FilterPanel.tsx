import { getDomains } from 'app/domains';
import { useAppDispatch, useAppSelector } from 'app/hooks';
import { DataType } from 'create/types';
import React, { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Select } from 'ui';

import {
  setFilterType,
  setUserIdFilter,
  setSortKey,
  setSortOrder,
  setSourceFilter,
} from '../lifeSlice';
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
  let [searchParams, setSearchParams] = useSearchParams();

  const domains = useMemo(() => getDomains(), []);
  const sourceOptions = ['All', ...domains.map((domain) => domain.source)];

  useEffect(() => {
    dispatch(setFilterType(searchParams.get('filterType') || ''));
    dispatch(setUserIdFilter(searchParams.get('userIdFilter') || ''));
    dispatch(setSortKey(searchParams.get('sortKey') || ''));
    dispatch(setSortOrder(searchParams.get('sortOrder') || ''));
  }, []);
  const handleFilterTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    dispatch(setFilterType(event.target.value));
    setSearchParams({ filterType: event.target.value });
  };

  const handleUserIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setUserIdFilter(event.target.value));
    setSearchParams({ userIdFilter: event.target.value });
  };
  const handleSortKeyChange = (event) => {
    dispatch(setSortKey(event.target.value));
    setSearchParams({ sortKey: event.target.value });
  };

  const handleSortOrderChange = (event) => {
    dispatch(setSortOrder(event.target.value));
    setSearchParams({ sortOrder: event.target.value });
  };
  const handleSourceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    dispatch(setSourceFilter(event.target.value));
    setSearchParams({ ...searchParams, source: event.target.value });
  };

  return (
    <Card className="my-4 p-4 shadow-lg">
      <div className="flex flex-wrap gap-6 border-b pb-4 mb-4">
        <div className="flex flex-col gap-2">
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
        <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
          <label
            htmlFor="userIdFilter"
            className="text-sm font-medium text-gray-700"
          >
            User ID Filter:
          </label>
          <input
            id="userIdFilter"
            value={userIdFilter}
            onChange={handleUserIdChange}
            placeholder="Enter User ID"
            className="w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      <div className="mb-4">
        <span className="text-sm font-medium text-gray-700">
          Data Count: {filteredData.length}
        </span>
      </div>
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
            className="w-full p-2 border border-gray-300 rounded shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">
            Sort Order:
          </label>
          <Select
            id="sortOrder"
            onChange={handleSortOrderChange}
            options={['asc', 'desc']}
            placeholder="Select sort order"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label htmlFor="source" className="text-sm font-medium text-gray-700">
            Source:
          </label>
          <Select
            id="source"
            onChange={handleSourceChange}
            options={sourceOptions}
            placeholder="Select source"
          />
        </div>
      </div>
    </Card>
  );
};
