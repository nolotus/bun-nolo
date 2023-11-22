import { useAppSelector } from 'app/hooks';
import React from 'react';

import { AccountBalance } from '../blocks/AccountBanlance';
import DataList from '../blocks/DataList';
import { FilterPanel } from '../blocks/FilterPanel';
import { useFetchData } from '../hooks/useFetchData';
import { selectFilteredLifeData } from '../selectors';
export const LifeAll = () => {
  const { fetchData } = useFetchData();
  const data = useAppSelector(selectFilteredLifeData);

  return (
    <div className="p-4">
      <AccountBalance />
      <FilterPanel />
      <DataList data={data} refreshData={fetchData} />
    </div>
  );
};

export default LifeAll;
