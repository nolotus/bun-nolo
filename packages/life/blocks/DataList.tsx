import { useAppSelector } from 'app/hooks';
import React from 'react';

import { selectFilteredLifeData } from '../selectors';

import DataItem from './DataItem';

const DataList = ({ refreshData }) => {
  const data = useAppSelector(selectFilteredLifeData);

  return (
    <div className="space-y-4">
      {data
        ? data.map((item) => (
            <div className="p-2" key={item.id}>
              <DataItem
                dataId={item.id}
                content={item.value}
                refreshData={refreshData}
                source={item.source}
              />
            </div>
          ))
        : 'Loading...'}
    </div>
  );
};

export default DataList;
