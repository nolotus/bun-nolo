import { useAppSelector } from 'app/hooks';
import { selectPages } from 'database/selectors';
import React from 'react';

import DataList from '../blocks/DataList';
import { FilterPanel } from '../blocks/FilterPanel';
import { useFetchData } from '../hooks/useFetchData';
export const Notes = () => {
  const data = useAppSelector(selectPages);
  const { fetchData } = useFetchData();

  return (
    <div className="p-4">
      <FilterPanel />
      <DataList data={data} refreshData={fetchData} />
    </div>
  );
};

export default Notes;
