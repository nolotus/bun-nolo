import { TrashIcon, RepoPullIcon, RepoPushIcon } from "@primer/octicons-react";
import { useAppDispatch, useAuth } from "app/hooks";
import { extractAndDecodePrefix, extractCustomId, extractUserId } from "core";
import { deleteData } from "database/dbSlice";
import { useDeleteEntryMutation, useWriteMutation } from "database/services";
import { omit } from "rambda";
import React, { useState } from "react";
import { Card } from "ui";

import DataItem from "./DataItem";

const DataList = ({ data, refreshData }) => {
  const auth = useAuth();
  const dispatch = useAppDispatch();
  const [deleteEntry] = useDeleteEntryMutation();
  const [write] = useWriteMutation();
  const pullData = async (id, value) => {
    // Define the logic for pulling data here
    const flags = extractAndDecodePrefix(id);
    const userId = extractUserId(id);
    const customId = extractCustomId(id);
    const formatValue = omit("id", value);

    await write({
      data: formatValue,
      flags,
      userId,
      customId,
      domain: "http://localhost",
    }).unwrap();
    refreshData(auth.user?.userId);
  };

  const pushData = async (id: string, value, domains: string[]) => {
    // 先对数据进行格式化
    const formatValue = omit("id", value);
    const customId = extractCustomId(id);
    const flags = extractAndDecodePrefix(id);
    const userId = extractUserId(id);

    // 遍历所有域名并对每个执行 write 操作
    for (const domain of domains) {
      await write({
        data: formatValue,
        flags,
        userId,
        customId,
        domain,
      }).unwrap();
    }

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

  const toggleSelectAll = () => {
    const newSelectedItems = data.map((item) => item.id);

    setSelectedItems(newSelectedItems);
  };

  const deleteSelectedItems = async () => {
    await Promise.all(
      Object.keys(selectedItems).map((itemId) =>
        deleteEntry({ entryId: itemId }),
      ),
    );
    refreshData(auth.user?.userId);
  };
  const paySelectedItems = async () => {
    const data = {
      payIds: [],
    };
    // refreshData(auth.user?.userId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <input
            type="checkbox"
            checked={Object.keys(selectedItems).length === data.length}
            onChange={toggleSelectAll}
          />
          <label>全选</label>
        </div>
        <button
          onClick={paySelectedItems}
          className="rounded bg-red-500 p-2 text-white hover:bg-red-400"
        >
          支付
        </button>
        <button
          onClick={deleteSelectedItems}
          className="rounded bg-red-500 p-2 text-white hover:bg-red-400"
        >
          删除选中
        </button>
      </div>

      {data
        ? data.map((item) => (
            <div className="group flex" key={item.id}>
              <div className="invisible mr-4 flex flex-col space-y-2 group-hover:visible">
                <button
                  onClick={() => pullData(item.id, item)}
                  className="rounded bg-yellow-500 p-2 text-white hover:bg-yellow-400"
                >
                  <RepoPullIcon size={16} />
                </button>
                <button
                  onClick={() => pushData(item.id, item)}
                  className="rounded bg-green-500 p-2 text-white hover:bg-green-400"
                >
                  <RepoPushIcon size={16} />
                </button>
                <button
                  onClick={() => deleteItem(item.id, item.source)}
                  className="rounded bg-red-500 p-2 text-white hover:bg-red-400"
                >
                  <TrashIcon size={16} />
                </button>
              </div>
              <Card>
                <DataItem
                  dataId={item.id}
                  content={item}
                  refreshData={refreshData}
                  source={item.source}
                />
                <ul className="-m-1 flex flex-wrap">
                  {item.source.map((src, index) => (
                    <li key={index} className="m-1">
                      <span className="mr-2 inline-block rounded bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800">
                        {src}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          ))
        : "Loading..."}
    </div>
  );
};

export default DataList;
