import React, { useState } from "react";
import { Map, ToolBarControl, Marker } from "@uiw/react-amap";

const GaodeMap = ({ lat = 31.86119, lng = 117.283042, title }) => {
  const [center, setCenter] = useState([lng, lat]);
  return (
    <Map style={{ height: 300 }} center={center}>
      <ToolBarControl position="RB" />
      <Marker
        title="北京市"
        // offset={new AMap.Pixel(-13, -30)}
        label={{
          // 设置文本标注偏移量
          // offset: new AMap.Pixel(20, 20),
          // 设置文本标注内容
          content: `<div class='info'>${title}</div>`,
          // 设置文本标注方位
          direction: "right",
        }}
        position={new AMap.LngLat(Number(lng), Number(lat))}
      />
    </Map>
  );
};
export default GaodeMap;
