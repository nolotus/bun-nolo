import { TrashIcon, RepoPullIcon, RepoPushIcon } from "@primer/octicons-react";
import { useAppDispatch, useAuth } from "app/hooks";
import { extractAndDecodePrefix, extractCustomId, extractUserId } from "core";
import { deleteData } from "database/dbSlice";
import { useDeleteEntryMutation, useWriteMutation } from "database/services";
import { omit } from "rambda";
import React, { useState } from "react";

import NoteItem from "./NoteItem";

const NoteList = ({ data, refreshData }) => {
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

  const pushData = async (id: string, value) => {
    // 调用 write mutation 并传递 domain 参数
    const formatValue = omit("id", value);
    const customId = extractCustomId(id);
    const flags = extractAndDecodePrefix(id);
    const userId = extractUserId(id);

    await write({
      data: formatValue,
      flags,
      userId,
      customId,
      domain: "http://nolotus.com",
    }).unwrap();
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
          type="button"
          onClick={paySelectedItems}
          className="rounded bg-red-500 p-2 text-white hover:bg-red-400"
        >
          支付
        </button>
        <button
          type="button"
          onClick={deleteSelectedItems}
          className="rounded bg-red-500 p-2 text-white hover:bg-red-400"
        >
          删除选中
        </button>
      </div>
      <div className="flex flex-wrap">
        {data
          ? data.map((item) => (
              <div
                className="group flex w-full p-2 sm:w-full md:w-1/2 lg:w-1/3 xl:w-1/4"
                key={item.id}
              >
                <div>
                  <NoteItem
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
                </div>
                <div className="invisible ml-4 flex flex-col space-y-2 group-hover:visible">
                  <button
                    type="button"
                    onClick={() => pullData(item.id, item)}
                    className="rounded bg-yellow-500 p-2 text-white hover:bg-yellow-400"
                  >
                    <RepoPullIcon size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => pushData(item.id, item)}
                    className="rounded bg-green-500 p-2 text-white hover:bg-green-400"
                  >
                    <RepoPushIcon size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteItem(item.id, item.source)}
                    className="rounded bg-red-500 p-2 text-white hover:bg-red-400"
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              </div>
            ))
          : "Loading..."}
      </div>
    </div>
  );
};

export default NoteList;
