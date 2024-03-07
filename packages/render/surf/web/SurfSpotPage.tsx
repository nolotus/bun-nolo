import React from "react";
import GaodeMap from "render/map/GaodeMap";
import { APILoader } from "@uiw/react-amap";
//be careful APILoader can't in entry or Map file, you could try will debug

import { WeatherRelate } from "./WeatherRelate";
import Card from "./Card";
// 定义SurfSpotDescription组件的props类型
interface SurfSpotDescriptionProps {
  title: string;
  description: string;
}

import { ShareIcon, PinIcon, PlusIcon } from "@primer/octicons-react";

const SurfSpotDescription = ({
  title,
  description,
}: SurfSpotDescriptionProps) => (
  <Card>
    <div className="flex items-center justify-between">
      <Card.Title>{title}</Card.Title>
      <Card.Actions>
        <button className="flex items-center rounded-md bg-orange-500 px-2 py-1 text-sm text-white hover:bg-orange-600">
          <ShareIcon size={20} className="mr-1" />
          分享浪点
        </button>
      </Card.Actions>
    </div>
    <p className="text-gray-700">{description}</p>
  </Card>
);

const Surfers = () => (
  <Card>
    <div className="flex items-center justify-between">
      <Card.Title>最近下浪的人</Card.Title>
      <Card.Actions>
        <button className="flex items-center rounded-md bg-green-500 px-2 py-1 text-sm text-white hover:bg-green-600">
          <PinIcon size={20} className="mr-1" /> {/* 更换为 PinIcon */}
          留下足迹
        </button>
      </Card.Actions>
    </div>
    {/* 这里插入正在下浪的人的信息 */}
  </Card>
);

const NearbyClubs = () => (
  <Card>
    <div className="flex items-center justify-between">
      <Card.Title>附近的俱乐部</Card.Title>
      <Card.Actions>
        <button className="flex items-center rounded-md bg-blue-500 px-2 py-1 text-sm text-white hover:bg-blue-600">
          <PlusIcon size={20} className="mr-1" />
          添加我的俱乐部
        </button>
      </Card.Actions>
    </div>
    {/* 这里插入附近俱乐部的信息 */}
  </Card>
);
// 定义SurfSpotPage组件的props类型
interface SurfSpotData {
  lat?: number;
  lng?: number;
  title: string;
}

interface SurfSpotPageProps {
  data: SurfSpotData;
}

const SurfSpotPage = ({ data }: SurfSpotPageProps) => {
  const { lat = 31.86119, lng = 117.283042, title } = data;

  return (
    <div className="mt-4">
      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/2">
          <div className="mb-4 h-64 overflow-hidden bg-gray-200 lg:h-[400px]">
            <APILoader version="2.0.5" akey="a7a90e05a37d3f6bf76d4a9032fc9129">
              <GaodeMap lat={lat} lng={lng} title={title} />
            </APILoader>
          </div>
          <div className="mb-4 lg:hidden">
            <WeatherRelate lat={lat} lng={lng} />
          </div>
          <div className="hidden lg:mt-4 lg:block">
            <WeatherRelate lat={lat} lng={lng} />
          </div>
        </div>

        <div className="w-full lg:w-1/2 lg:pl-4">
          <SurfSpotDescription title={title} description="xxx" />
          <Surfers />
          <NearbyClubs />
        </div>
      </div>
    </div>
  );
};

export default SurfSpotPage;
