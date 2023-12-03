import { WeatherQueryParams } from '.';
export const parseWeatherParams = ({ lat, lng }): WeatherQueryParams => {
  return {
    lat,
    lng,
    params: [
      'airTemperature',
      'pressure',
      'cloudCover',
      'currentDirection',
      'currentSpeed',
      'gust',
      'humidity',
      'precipitation',
      'seaLevel',
      'swellDirection',
      'swellHeight',
      'swellPeriod',
      'secondarySwellPeriod',
      'secondarySwellDirection',
      'secondarySwellHeight',
      'visibility',
      'waterTemperature',
      'waveDirection',
      'waveHeight',
      'wavePeriod',
      'windWaveDirection',
      'windWaveHeight',
      'windWavePeriod',
      'windDirection',
      'windSpeed',
    ],
  };
};

export const formatDataSnippet = (
  data: any[],
  maxItems: number = 5,
): string => {
  // 截取最多 maxItems 项数据
  const snippet = data.slice(0, maxItems);
  // 将截取的数据转换为 JSON 字符串并格式化显示
  return JSON.stringify(snippet, null, 2);
};
