import { useAppSelector } from 'app/hooks';
import { extractAndDecodePrefix, extractCustomId, extractUserId } from 'core';
import { useDeleteEntryMutation, useWriteMutation } from 'database/services';
import React from 'react';
import { Card } from 'ui';

import { selectFilteredLifeData } from '../selectors';

import DataItem from './DataItem';

const DataList = ({ refreshData }) => {
  const data = useAppSelector(selectFilteredLifeData);
  const [deleteEntry] = useDeleteEntryMutation();
  const [write] = useWriteMutation();
  const pullData = async (id, value) => {
    // Define the logic for pulling data here
    console.log('Data pulled from nolotus successfully');
    const flags = extractAndDecodePrefix(id);
    const userId = extractUserId(id);
    const customId = extractCustomId(id);

    await write({
      data: value,
      flags,
      userId,
      customId,
      domain: 'http://localhost',
    }).unwrap();
    refreshData();
  };

  const pushData = async (id: string, value) => {
    // 调用 write mutation 并传递 domain 参数
    console.log('key', id);
    const customId = extractCustomId(id);
    const flags = extractAndDecodePrefix(id);
    const userId = extractUserId(id);

    await write({
      data: value,
      flags,
      userId,
      customId,
      domain: 'http://nolotus.com',
    }).unwrap();
    console.log('Data pushed to nolotus successfully');
    refreshData();
  };

  const deleteItem = async (dataId: string) => {
    await deleteEntry({ entryId: dataId });
    console.log('Data deleted successfully');
    refreshData();
  };

  return (
    <div className="space-y-4">
      {data
        ? data.map((item) => (
            <Card key={item.id}>
              <DataItem
                dataId={item.id}
                content={item.value}
                refreshData={refreshData}
                source={item.source}
              />
              <ul className="flex flex-wrap -m-1">
                {item.source.map((src, index) => (
                  <li key={index} className="m-1">
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                      {src}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex space-x-2">
                <button
                  onClick={() => pullData(item.id, item.value)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded"
                >
                  Pull
                </button>
                <button
                  onClick={() => pushData(item.id, item.value)}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Push
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>
              </div>
            </Card>
          ))
        : 'Loading...'}
    </div>
  );
};

export default DataList;
