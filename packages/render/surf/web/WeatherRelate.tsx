import { parseWeatherParams, useGetWeatherQuery } from "integrations/weather";

import ToggleButton from "./Buttons";
import { WeatherDisplay } from "./WeatherDisplay";
import { modes, intervals } from "../config";
import useSurfSpot from "../useSurfSpot";
import { SurfTideChart } from "./Chart";

export const WeatherRelate = ({ lat, lng }) => {
  const queryParams = parseWeatherParams({ lat, lng });

  const { data, error, isLoading, isSuccess } = useGetWeatherQuery(queryParams);

  const { mode, interval, handleModeChange, handleIntervalChange } =
    useSurfSpot();

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
        <div className="mb-4 mt-4 flex w-full flex-row items-center justify-between">
          <div className="flex-frow flex flex-row" style={{ flex: "0.2" }}>
            {intervals.map((intervalItem) => (
              <ToggleButton
                key={intervalItem.value}
                value={intervalItem.value}
                title={intervalItem.title}
                isActive={interval === intervalItem.value}
                onPress={() => handleIntervalChange(intervalItem.value)}
              />
            ))}
          </div>

          <div className="flex flex-row" style={{ flex: 0.6 }}>
            {modes.map((item) => (
              <ToggleButton
                key={item.value}
                value={item.value}
                title={item.title}
                isActive={mode === item.value}
                onPress={handleModeChange}
              />
            ))}
          </div>
        </div>

        <WeatherDisplay mode={mode} interval={interval} hours={data.hours} />
      </>
    );
  }
};
