import React from 'react';
import DataItem from './DataItem';

const OtherDataBlock = ({data, refreshData}) => {
  return (
    <div className="space-y-4">
      {data
        ? data.map(item => (
            <div className="p-2" key={item.key}>
              <DataItem
                dataId={item.key}
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

export default OtherDataBlock;
