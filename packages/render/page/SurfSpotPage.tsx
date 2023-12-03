import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { useGetWeatherQuery, parseWeatherParams } from 'integrations/weather';
import React, { useEffect, useState } from 'react';

const SurfSpotPage = ({ data }) => {
  const { lat, lng } = data;
  const queryParams = parseWeatherParams({ lat, lng }); // 解析出天气查询参数的函数

  const {
    data: weatherData,
    error,
    isLoading,
    isSuccess,
  } = useGetWeatherQuery(queryParams);
  console.log('');

  const formatTime = (timeString) => {
    const time = new Date(timeString);
    return format(time, 'MM/dd HH:mm', { locale: zhCN });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-gray-900 my-6">海滩冲浪地点</h1>
      <div className="mb-4">
        <p className="text-gray-700">经度：{data.lng}</p>
        <p className="text-gray-700">纬度：{data.lat}</p>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        每小时天气预报
      </h2>

      <div className="flex bg-white shadow">
        <div className="sticky top-0 z-10 bg-white p-4">
          <div className="grid grid-cols-1 gap-y-2 text-sm">
            <div className="font-semibold text-gray-800">时间</div>
            <div className="text-gray-600">气温</div>
            <div className="text-gray-600">云量</div>
            <div className="text-gray-600">水流方向</div>
            <div className="text-gray-600">水流速度</div>
            <div className="text-gray-600">阵风</div>
            <div className="text-gray-600">湿度</div>
            <div className="text-gray-600">降水量</div>
            <div className="text-gray-600">气压</div>
            <div className="text-gray-600">海平面</div>
            <div className="text-gray-600">次级浪向</div>
            <div className="text-gray-600">次级浪高</div>
            <div className="text-gray-600">次级浪周期</div>
            <div className="text-gray-600">主浪向</div>
            <div className="text-gray-600">主浪高</div>
            <div className="text-gray-600">主浪周期</div>
            <div className="text-gray-600">能见度</div>
            <div className="text-gray-600">水温</div>
            <div className="text-gray-600">风向</div>
            <div className="text-gray-600">风速</div>
            <div className="text-gray-600">风浪向</div>
            <div className="text-gray-600">风浪高</div>
            <div className="text-gray-600">风浪周期</div>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <div className="flex space-x-4">
            {weatherData?.hours.map((hour, index) => (
              <div
                key={index}
                className="min-w-max grid grid-cols-1 gap-y-2 p-4 bg-gray-50 even:bg-white"
              >
                <div className="font-semibold text-gray-800">
                  {formatTime(hour.time)}
                </div>
                <div className="text-gray-600 text-sm">
                  {hour.airTemperature.sg.toFixed(1)}°C
                </div>
                <div className="text-gray-600 text-sm">
                  {hour.cloudCover.sg}%
                </div>
                <div className="text-gray-600 text-sm">
                  {hour.currentDirection?.sg.toFixed(1)}°
                </div>
                <div className="text-gray-600 text-sm">
                  {hour.currentSpeed?.sg.toFixed(2)}m/s
                </div>
                <div className="text-gray-600 text-sm">
                  {hour.gust.sg.toFixed(1)}m/s
                </div>
                <div className="text-gray-600 text-sm">{hour.humidity.sg}%</div>
                <div className="text-gray-600 text-sm">
                  {hour.precipitation.sg.toFixed(1)}mm
                </div>
                <div className="text-gray-600 text-sm">
                  {hour.pressure.sg.toFixed(1)}hPa
                </div>
                <div className="text-gray-600 text-sm">
                  {hour.seaLevel?.sg.toFixed(2)}m
                </div>
                <div className="text-gray-600 text-sm">
                  {hour.secondarySwellDirection?.sg.toFixed(1)}°
                </div>
                <div className="text-gray-600 text-sm">
                  {hour.secondarySwellHeight?.sg.toFixed(2)}m
                </div>
                <div className="text-gray-600 text-sm">
                  {hour.secondarySwellPeriod?.sg.toFixed(2)}s
                </div>
                <div className="text-gray-600 text-sm">
                  {hour.swellDirection?.sg.toFixed(1)}°
                </div>
                <div className="text-gray-600 text-sm">
                  {hour.swellHeight?.sg.toFixed(2)}m
                </div>
                <div className="text-gray-600 text-sm">
                  {hour.swellPeriod?.sg.toFixed(2)}s
                </div>
                <div className="text-gray-600 text-sm">
                  {hour.visibility?.sg.toFixed(1)}km
                </div>
                <div className="text-gray-600 text-sm">
                  {hour.waterTemperature?.sg.toFixed(1)}°C
                </div>
                <div className="text-gray-600 text-sm">
                  {hour.windDirection?.sg.toFixed(1)}°
                </div>
                <div className="text-gray-600 text-sm">
                  {hour.windSpeed?.sg.toFixed(2)}m/s
                </div>
                <div className="text-gray-600 text-sm">
                  {hour.windWaveDirection?.sg.toFixed(1)}°
                </div>
                <div className="text-gray-600 text-sm">
                  {hour.windWaveHeight?.sg.toFixed(2)}m
                </div>
                <div className="text-gray-600 text-sm">
                  {hour.windWavePeriod?.sg.toFixed(2)}s
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default SurfSpotPage;
