import { PlusIcon } from "@primer/octicons-react";
import { nolotusId } from "core/init";
import { DataType } from "create/types";
import React from "react";
import { SpotCard } from "render/components/SpotCard";
import { useAppSelector, useQueryData } from "app/hooks";
import { selectFilteredDataByUserAndType } from "database/selectors";

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
  const queryConfig = {
    queryUserId: nolotusId,
    options,
  };

  const { isLoading, error } = useQueryData(queryConfig);
  const data = useAppSelector(
    selectFilteredDataByUserAndType(nolotusId, DataType.SurfSpot),
  );
  // 定义函数来渲染条目列表，过滤掉 is_template 的项

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error loading data.</div>;
  }

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-between p-2">
        <h2 className="">浪点</h2>
        {/* <button className="flex items-center px-3 py-2 text-sm font-semibold text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-700">
          <PlusIcon size={16} className="mr-2" />
          新增浪点
        </button> */}
      </div>
      <div className="flex flex-wrap">{data && renderSpotList(data)}</div>
      <div className="flex items-center justify-between p-4">
        {/* <h1 className="text-2xl font-bold text-gray-700">旅居点</h1> */}
        {/* <button className="flex items-center px-3 py-2 text-sm font-semibold text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-700">
          <PlusIcon size={16} className="mr-2" />
          新增浪点
        </button> */}
      </div>
      {/* <div className="flex flex-wrap">{isSuccess && renderSpotList(data)}</div> */}
      <div className="flex items-center justify-between p-4">
        {/* <h1 className="text-2xl font-bold text-gray-700">餐饮</h1> */}
        {/* <button className="flex items-center px-3 py-2 text-sm font-semibold text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-700">
          <PlusIcon size={16} className="mr-2" />
          新增浪点
        </button> */}
      </div>
      {/* <div className=" flex flex-wrap">{isSuccess && renderSpotList(data)}</div> */}
    </div>
  );
};

export default Spots;
