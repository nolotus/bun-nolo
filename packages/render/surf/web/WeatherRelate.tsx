import { parseWeatherParams, useGetWeatherQuery } from "integrations/weather";

import { WeatherDisplay } from "./WeatherDisplay";
import { modes, intervals } from "../config";

export const WeatherRelate = ({ lat, lng }) => {
  const queryParams = parseWeatherParams({ lat, lng });

  const { data, isLoading } = useGetWeatherQuery(queryParams);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-lg">正在加载天气数据...</div>
      </div>
    );
  }
  if (data) {
    return (
      <>
        <WeatherDisplay
          mode={modes[0].value}
          interval={intervals[0].value}
          hours={data.hours}
        />
      </>
    );
  }
};
