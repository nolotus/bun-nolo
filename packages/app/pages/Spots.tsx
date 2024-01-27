import { PlusIcon } from "@primer/octicons-react";
import { nolotusId } from "core/init";
import { DataType } from "create/types";
import { useGetEntriesQuery } from "database/services";
import React from "react";
import { SpotCard } from "render/components/SpotCard";
const options = {
  isJSON: true,
  condition: {
    type: DataType.SurfSpot,
  },
  limit: 20,
};
const renderSpotList = (spots) => {
  if (!spots) {
    return null;
  }

  const filteredSpots = spots.filter((spot) => !spot.is_template);

  return filteredSpots.map((spot) => <SpotCard key={spot.id} data={spot} />);
};
const Spots = () => {
  const { data, error, isLoading, isSuccess } = useGetEntriesQuery({
    userId: nolotusId,
    options,
  });
  // 定义函数来渲染条目列表，过滤掉 is_template 的项

  // 根据加载状态渲染组件
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error loading data.</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between p-4">
        <h1 className="text-2xl font-bold text-gray-700">浪点</h1>
        {/* <button className="flex items-center px-3 py-2 text-sm font-semibold text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-700">
          <PlusIcon size={16} className="mr-2" />
          新增浪点
        </button> */}
      </div>
      <div className="flex flex-wrap">{isSuccess && renderSpotList(data)}</div>
      <div className="flex items-center justify-between p-4">
        <h1 className="text-2xl font-bold text-gray-700">旅居点</h1>
        {/* <button className="flex items-center px-3 py-2 text-sm font-semibold text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-700">
          <PlusIcon size={16} className="mr-2" />
          新增浪点
        </button> */}
      </div>
      <div className="flex flex-wrap">{isSuccess && renderSpotList(data)}</div>
      <div className="flex items-center justify-between p-4">
        <h1 className="text-2xl font-bold text-gray-700">餐饮</h1>
        {/* <button className="flex items-center px-3 py-2 text-sm font-semibold text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-700">
          <PlusIcon size={16} className="mr-2" />
          新增浪点
        </button> */}
      </div>
      <div className=" flex flex-wrap">{isSuccess && renderSpotList(data)}</div>
    </>
  );
};

export default Spots;
