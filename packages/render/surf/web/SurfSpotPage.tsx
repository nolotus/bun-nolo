import GaodeMap from "render/map/GaodeMap";
import { APILoader } from "@uiw/react-amap";
//be careful APILoader can't in entry or Map file, you could try will debug
import { renderContentNode } from "render";
import { useMediaQuery } from "react-responsive";
import OpenProps from "open-props";
import { WeatherRelate } from "./WeatherRelate";
import Card from "./Card";
// 定义SurfSpotDescription组件的props类型
interface SurfSpotDescriptionProps {
  title: string;
  description: string;
}

import { ShareIcon } from "@primer/octicons-react";
import { useFetchData } from "app/hooks";
import { PageLoader } from "../../blocks/PageLoader";

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

interface SurfSpotPageProps {
  id: string;
  source: string;
}

const SurfSpotPage = ({ id, source }: SurfSpotPageProps) => {
  const { data, isLoading } = useFetchData(id, source);
  // const mobile = useMediaQuery({ minWidth: 640 });
  // const tablet = useMediaQuery({ minWidth: 768 });
  // const monitor = useMediaQuery({ minWidth: 1281 });
  if (isLoading) {
    return <PageLoader />;
  }
  if (data) {
    const { title, lat = 31.86119, lng = 117.283042 } = data;
    return (
      <div style={{ marginTop: OpenProps.sizeFluid2 }}>
        <div style={{ display: "flex" }}>
          <div style={{ width: "45%", marginRight: "10%" }}>
            <SurfSpotDescription
              title={title}
              description={data.mdast.children[2]}
            />
          </div>

          <div style={{ width: "45%" }}>
            <div
              className="surface2 h-64 overflow-hidden"
              style={{ marginBottom: OpenProps["--size-fluid-2"] }}
            >
              <APILoader
                version="2.0.5"
                akey="56b1c6772542a92ab459923a7c556566"
              >
                <GaodeMap lat={lat} lng={lng} title={title} />
              </APILoader>
            </div>
          </div>
        </div>
        <WeatherRelate lat={lat} lng={lng} />
      </div>
    );
  }
};

export default SurfSpotPage;
