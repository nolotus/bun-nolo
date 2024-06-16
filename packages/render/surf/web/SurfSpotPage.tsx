import GaodeMap from "render/map/GaodeMap";
import { APILoader } from "@uiw/react-amap";
//be careful APILoader can't in entry or Map file, you could try will debug
import { renderContentNode } from "render";
import { useMediaQuery } from "react-responsive";

import { WeatherRelate } from "./WeatherRelate";
import Card from "./Card";
// 定义SurfSpotDescription组件的props类型
interface SurfSpotDescriptionProps {
  title: string;
  description: string;
}

import { ShareIcon } from "@primer/octicons-react";

const SurfSpotDescription = ({
  title,
  description,
}: SurfSpotDescriptionProps) => (
  <div>
    <div className="flex items-center justify-between">
      <Card.Title>{title}</Card.Title>
      <Card.Actions>
        <button className="flex items-center rounded-md  px-2 py-1 text-sm ">
          <ShareIcon size={20} className="mr-1" />
          分享浪点
        </button>
      </Card.Actions>
    </div>
    {description && <p>{renderContentNode(description)}</p>}
  </div>
);

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
  // const mobile = useMediaQuery({ minWidth: 640 });
  // const tablet = useMediaQuery({ minWidth: 768 });
  // const laptop = useMediaQuery({ minWidth: 768, maxWidth: 1280 });
  // const monitor = useMediaQuery({ minWidth: 1281 });
  return (
    <>
      <SurfSpotDescription title={title} description={data.mdast.children[2]} />
      <div className="w-full">
        <div className="mb-4 h-64 overflow-hidden bg-gray-200 lg:h-[300px]">
          <APILoader version="2.0.5" akey="56b1c6772542a92ab459923a7c556566">
            <GaodeMap lat={lat} lng={lng} title={title} />
          </APILoader>
        </div>
      </div>
      <WeatherRelate lat={lat} lng={lng} />
    </>
  );
};

export default SurfSpotPage;
