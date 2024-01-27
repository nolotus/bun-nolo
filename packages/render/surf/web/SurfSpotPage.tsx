import React from "react";
import Map from "render/map/GoogleMap";
import { WeatherRelate } from "./WeatherRelate";

const SurfSpotDescription = ({ title, description }) => (
  <div className="bg-gray-50 p-4">
    <h1 className="my-6 text-xl font-bold text-gray-900">{title}</h1>
    <h2 className="mb-2 text-lg font-semibold text-gray-900">浪点描述</h2>
    <p className="text-gray-700">{description}</p>
  </div>
);

const SurfSpotPage = ({ data }) => {
  const { lat, lng } = data;

  return (
    <div className="mx-auto max-w-full p-0 sm:p-2 md:p-4 lg:p-6 xl:p-8">
      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/2">
          <div className="mb-4 h-64 overflow-hidden bg-gray-200 lg:h-[400px]">
            <Map lat={lat} lng={lng} title={data.title} />
          </div>
          <div className="mb-4 lg:hidden">
            <WeatherRelate lat={lat} lng={lng} />
          </div>
          <div className="hidden lg:mt-4 lg:block">
            <WeatherRelate lat={lat} lng={lng} />
          </div>
        </div>

        <div className="w-full lg:w-1/2 lg:pl-4">
          <SurfSpotDescription title={data.title} description="xxx" />
        </div>
      </div>
    </div>
  );
};

export default SurfSpotPage;
