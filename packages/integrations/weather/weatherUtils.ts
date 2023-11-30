import { WeatherQueryParams } from '.';
export const parseWeatherParams = (message: string): WeatherQueryParams => {
  return {
    lat: 22.603494850535416, // 假设的纬度值
    lng: 114.90834694390016, // 假设的经度值
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
    start: '2023-11-30T00:00:00Z',
    end: '2023-12-03T00:00:00Z',
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
