import { TrashIcon, RepoPullIcon, RepoPushIcon } from '@primer/octicons-react';
import { useAppDispatch, useAppSelector, useAuth } from 'app/hooks';
import { extractAndDecodePrefix, extractCustomId, extractUserId } from 'core';
import { deleteData } from 'database/dbSlice';
import { useDeleteEntryMutation, useWriteMutation } from 'database/services';
import React, { useState } from 'react';
import { Card } from 'ui';

import { selectFilteredLifeData } from '../selectors';

import DataItem from './DataItem';

const DataList = ({ refreshData }) => {
  const auth = useAuth();
  const data = useAppSelector(selectFilteredLifeData);
  const dispatch = useAppDispatch();
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
    refreshData(auth.user?.userId);
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
    refreshData(auth.user?.userId);
  };

  const deleteItem = async (dataId: string, domains: string[]) => {
    for (const domain of domains) {
      await deleteEntry({ entryId: dataId, domain });
      console.log(`Data deleted successfully from domain: ${domain}`);
    }
    dispatch(deleteData(dataId));
  };

  const [selectedItems, setSelectedItems] = useState({});

  // 其他函数保持不变

  const toggleSelectAll = () => {
    const newSelectedItems = {};
    if (Object.keys(selectedItems).length !== data.length) {
      data.forEach((item) => {
        newSelectedItems[item.id] = true;
      });
    }
    setSelectedItems(newSelectedItems);
  };

  const deleteSelectedItems = async () => {
    await Promise.all(
      Object.keys(selectedItems).map((itemId) =>
        deleteEntry({ entryId: itemId }),
      ),
    );
    console.log('Selected data deleted successfully');
    refreshData(auth.user?.userId);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <input
            type="checkbox"
            checked={Object.keys(selectedItems).length === data.length}
            onChange={toggleSelectAll}
          />
          <label>全选</label>
        </div>
        <button
          onClick={deleteSelectedItems}
          className="bg-red-500 text-white p-2 rounded hover:bg-red-400"
        >
          删除选中
        </button>
      </div>

      {data
        ? data.map((item) => (
            <div className="flex group" key={item.id}>
              <div className="flex flex-col space-y-2 mr-4 invisible group-hover:visible">
                <button
                  onClick={() => pullData(item.id, item.value)}
                  className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-400"
                >
                  <RepoPullIcon size={16} />
                </button>
                <button
                  onClick={() => pushData(item.id, item.value)}
                  className="bg-green-500 text-white p-2 rounded hover:bg-green-400"
                >
                  <RepoPushIcon size={16} />
                </button>
                <button
                  onClick={() => deleteItem(item.id, item.source)}
                  className="bg-red-500 text-white p-2 rounded hover:bg-red-400"
                >
                  <TrashIcon size={16} />
                </button>
              </div>
              <Card>
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
              </Card>
            </div>
          ))
        : 'Loading...'}
    </div>
  );
};

export default DataList;
