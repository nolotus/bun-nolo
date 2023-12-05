import clsx from 'clsx';
import React, { useState } from 'react';

import { SourceChoose } from './SourceChoose';
import { WeatherDisplay } from './WeatherDisplay';
const SurfSpotPage = ({ data }) => {
  const { lat, lng } = data;

  const [mode, setMode] = useState('sg'); // 默认模式为 'sg'
  const [interval, setInterval] = useState(1); // 默认间隔设置为 1

  const handleModeChange = (newMode) => {
    setMode(newMode);
  };
  const handleIntervalChange = (newInterval) => {
    setInterval(newInterval);
  };
  return (
    <div className="mx-auto max-w-full">
      <h1 className="text-2xl font-bold text-gray-900 my-6">{data.title}</h1>
      <div className="mb-4">
        <p className="text-gray-700">经度：{lat}</p>
        <p className="text-gray-700">纬度：{lng}</p>
      </div>
      <div className="flex items-center gap-2 my-4">
        <button
          className={clsx(
            'px-3 py-2 text-sm font-medium rounded-md',
            interval === 1 ? 'bg-blue-600 text-white' : 'bg-gray-300',
          )}
          onClick={() => handleIntervalChange(1)}
        >
          1h
        </button>
        <button
          className={clsx(
            'px-3 py-2 text-sm font-medium rounded-md',
            interval === 3 ? 'bg-blue-600 text-white' : 'bg-gray-300',
          )}
          onClick={() => handleIntervalChange(3)}
        >
          3h
        </button>
      </div>
      <div className="w-full">
        <WeatherDisplay lat={lat} lng={lng} mode={mode} interval={interval} />
        <SourceChoose onChange={handleModeChange} />
      </div>
    </div>
  );
};
export default SurfSpotPage;
