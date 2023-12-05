import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useGetWeatherQuery, parseWeatherParams } from 'integrations/weather';
import React, { useEffect, useState } from 'react';

export const WeatherDisplay = ({ lat, lng, mode, interval = 1 }) => {
  const queryParams = parseWeatherParams({ lat, lng });
  const {
    data: weatherData,
    error,
    isLoading,
    isSuccess,
  } = useGetWeatherQuery(queryParams);

  const formatTime = (timeString) => {
    const time = new Date(timeString);
    return format(time, 'MM/dd HH:mm', { locale: zhCN });
  };

  const getDataByMode = (hour, field) => {
    return hour[field] && hour[field][mode]
      ? `${hour[field][mode].toFixed(1)}`
      : '-';
  };

  return (
    <div className="flex bg-white shadow">
      <div className="sticky top-0 z-10 bg-white p-4 opacity-90">
        <div className="space-y-1">
          <div className="text-gray-800">时间:</div>
          <div className="text-gray-600 truncate">浪向:</div>
          <div className="text-gray-600 truncate">风向:</div>
          <div className="text-gray-600 truncate">浪高:</div>
          <div className="text-gray-600 truncate">周期:</div>
          <div className="text-gray-600 truncate">水温:</div>
          <div className="text-gray-600 truncate">风速:</div>
          <div className="text-gray-600 truncate">阵风:</div>
          <div className="text-gray-600 truncate">气温:</div>
          <div className="text-gray-600 truncate">云量:</div>
          <div className="text-gray-600 truncate">降水:</div>
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        <div className="flex  p-4">
          {weatherData?.hours
            .filter((_, index) => index % interval === 0)
            .map((hour, index) => (
              <div key={index} className="min-w-max grid grid-cols-1 gap-y-2 ">
                <div className="font-semibold text-gray-800">
                  {formatTime(hour.time)}
                </div>
                <div className="text-gray-600 text-sm">
                  {getDataByMode(hour, 'swellDirection')}°
                </div>
                <div className="text-gray-600 text-sm">
                  {getDataByMode(hour, 'windDirection')}°
                </div>
                <div className="text-gray-600 text-sm">
                  {getDataByMode(hour, 'swellHeight')}m
                </div>
                <div className="text-gray-600 text-sm">
                  {getDataByMode(hour, 'swellPeriod')}s
                </div>
                <div className="text-gray-600 text-sm">
                  {getDataByMode(hour, 'waterTemperature')}s
                </div>

                <div className="text-gray-600 text-sm">
                  {getDataByMode(hour, 'windSpeed')}m/s
                </div>

                <div className="text-gray-600 text-sm">
                  {getDataByMode(hour, 'gust')}m/s
                </div>
                <div className="text-gray-600 text-sm">
                  {getDataByMode(hour, 'airTemperature')}°C
                </div>
                <div className="text-gray-600 text-sm">
                  {getDataByMode(hour, 'cloudCover')}%
                </div>
                <div className="text-gray-600 text-sm">
                  {getDataByMode(hour, 'precipitation')}mm
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
