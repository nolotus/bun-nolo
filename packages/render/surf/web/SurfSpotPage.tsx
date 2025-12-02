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

import { ShareIcon } from "@primer/octicons-react";
import { useFetchData } from "app/hooks";
import PageLoading from "render/web/ui/PageLoading";
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
    {description}
  </div>
);

const SurfSpotPage = ({ id }) => {
  const { data, isLoading } = useFetchData(id);
  if (isLoading) {
    return <PageLoading />;
  }
  if (data) {
    const { title, lat, lng } = data;
    return (
      <div style={{ marginTop: "clamp(1rem, 2vw, 1.5rem)" }}>
        <div style={{ display: "flex" }}>
          <div style={{ width: "45%", marginRight: "10%" }}>
            <SurfSpotDescription title={title} description={"need update"} />
          </div>

          <div style={{ width: "45%" }}>
            <div
              className="surface2 h-64 overflow-hidden"
              style={{ marginBottom: "clamp(1rem, 2vw, 1.5rem)" }}
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
