import { parseWeatherParams, useGetWeatherQuery } from "integrations/weather";
import { parseISO, format } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";

import ToggleButton from "./Buttons";
import { WeatherDisplay } from "./WeatherDisplay";
import { modes, intervals } from "../config";
import useSurfSpot from "../useSurfSpot";
import { SurfTideChart } from "./Chart";

export const WeatherRelate = ({ lat, lng }) => {
  const queryParams = parseWeatherParams({ lat, lng });

  const { data, error, isLoading, isSuccess } = useGetWeatherQuery(queryParams);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const groupedWeatherData = data?.hours.reduce(
    (acc: Record<string, any[]>, hour) => {
      const date = parseISO(hour.time); // 转换成 JS 日期对象
      const zonedDate = utcToZonedTime(date, timeZone); // 转换到当地时区时间
      const localDate = format(zonedDate, "yyyy-MM-dd", { timeZone }); // 按当地时区格式化日期

      if (!acc[localDate]) {
        acc[localDate] = [];
      }
      acc[localDate].push(hour);

      return acc;
    },
    {},
  );
  const { mode, interval, handleModeChange, handleIntervalChange } =
    useSurfSpot();

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-lg">正在加载天气数据...</div>
      </div>
    );
  }
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
      <div style={{ display: "flex", width: "100%", height: "300px" }}>
        <div style={{ display: "flex", width: "45%", marginRight: "5%" }}>
          <WeatherDisplay
            mode={mode}
            interval={interval}
            data={groupedWeatherData}
          />
        </div>
        <div style={{ display: "flex", width: "50%" }}>
          <SurfTideChart style={{ width: "100%" }} />
        </div>
      </div>
    </>
  );
};
