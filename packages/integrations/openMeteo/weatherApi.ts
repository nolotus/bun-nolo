import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { api } from 'app/api';

interface WeatherData {
  // 根据实际API返回的数据格式定义相应的接口
  hourly: {
    time: Date[],
    waveHeight: number[],
    waveDirection: number[],
    wavePeriod: number[],
    windWaveHeight: number[],
    windWaveDirection: number[],
    windWavePeriod: number[],
    windWavePeakPeriod: number[],
    swellWaveHeight: number[],
    swellWaveDirection: number[],
    swellWavePeriod: number[],
    swellWavePeakPeriod: number[],
  };
}

interface WeatherParams {
  latitude: number;
  longitude: number;
  hourly: string[];
}

const parseWeatherData = (response: any): WeatherData => {
  // Parsing logic here
  const utcOffsetSeconds = response.utcOffsetSeconds();
  const hourly = response.hourly();

  const hourlyTime = range(
    Number(hourly.time()),
    Number(hourly.timeEnd()),
    hourly.interval(),
  ).map((t) => new Date((t + utcOffsetSeconds) * 1000));

  // Parsing and structuring data similarly for other attributes
  return {
    hourly: {
      time: hourlyTime,
      waveHeight: hourly.variables(0)?.valuesArray() || [],
      waveDirection: hourly.variables(1)?.valuesArray() || [],
      wavePeriod: hourly.variables(2)?.valuesArray() || [],
      // Add other weather attributes following the same pattern
      // ...
    },
  };
};
const weatherApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWeather: builder.query<WeatherData, WeatherParams>({
      query: (params) => ({ url: 'marine', params }),
      transformResponse: (response: any) => {
        return parseWeatherData(response);
      },
    }),
  }),
});

export const { useGetWeatherQuery } = weatherApi;
