// 在 /src/hooks/useWeatherInfo.ts 文件中
import { weatherApi } from 'integrations/weather';

export const useWeatherInfo = () => {
  const [trigger, { data, error, isLoading, isUninitialized }] =
    weatherApi.endpoints.getWeather.useLazyQuery();

  const fetchWeatherInfo = async (queryParams) => {
    try {
      await trigger(queryParams);
    } catch (fetchError) {
      // 此处根据需要进行错误处理
    }
  };

  return {
    fetchWeatherInfo,
    weatherData: data,
    weatherLoading: isLoading,
    weatherError: error,
    isWeatherUninitialized: isUninitialized,
  };
};
