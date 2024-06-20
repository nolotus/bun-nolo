import { api } from "app/api";
import { API_ENDPOINTS } from "database/config";

import { WeatherQueryParams, WeatherApiResponse } from "./weatherTypes";

export const weatherApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWeather: builder.query<WeatherApiResponse, WeatherQueryParams>({
      query: (params) => {
        const searchParams = {
          lat: params.lat.toString(),
          lng: params.lng.toString(),
          params: params.params.join(","),
          // 其他可能的查询参数, 如果它们存在
          ...(params.start && { start: params.start }),
          ...(params.end && { end: params.end }),
          ...(params.source && { source: params.source }),
        };
        return {
          url: `${API_ENDPOINTS.WEATHER}`,
          params: searchParams,
        };
      },
    }),
  }),
});

export const { useGetWeatherQuery } = weatherApi;
