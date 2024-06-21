import { parseWeatherParams, useGetWeatherQuery } from "integrations/weather";
import React from "react";
import LabelsColumn from "./LabelsColumn";
import { parseISO, format } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import WeatherDataGrid from "./WeatherDataGrid";

export const WeatherDisplay = ({ lat, lng, mode, interval = 3 }) => {
  const queryParams = parseWeatherParams({ lat, lng });
  const {
    data: weatherData,
    error,
    isLoading,
    isSuccess,
  } = useGetWeatherQuery(queryParams);

  const containerStyle = "grid grid-cols-[minmax(auto,70px)_1fr]";

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-lg">正在加载天气数据...</div>
      </div>
    );
  }
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const groupedWeatherData = weatherData?.hours.reduce(
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
  return (
    <div className={containerStyle}>
      <LabelsColumn />
      {groupedWeatherData && (
        <WeatherDataGrid
          groupedWeatherData={groupedWeatherData}
          interval={interval}
          mode={mode}
        />
      )}
    </div>
  );
};
