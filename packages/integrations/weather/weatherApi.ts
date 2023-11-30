// /src/integrations/weatherApi.ts
import { api } from 'app/api';
import { API_ENDPOINTS } from 'database/config';

import { WeatherQueryParams, WeatherApiResponse } from './weatherTypes';

// uitlity function to create query string from WeatherQueryParams
const createQueryString = (params: WeatherQueryParams): URLSearchParams => {
  const { lat, lng, params: paramsList, start, end, source } = params;
  const searchParams = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
    params: paramsList.join(','),
  });

  if (start) {
    searchParams.set('start', start);
  }
  if (end) {
    searchParams.set('end', end);
  }
  if (source) {
    searchParams.set('source', source);
  }

  return searchParams;
};

export const weatherApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWeather: builder.query<WeatherApiResponse, WeatherQueryParams>({
      query: (queryParams) => {
        const searchParams = createQueryString(queryParams);
        return {
          url: `${API_ENDPOINTS.WEATHER}`,
          params: searchParams,
        };
      },
    }),
  }),
  overrideExisting: false,
});

export const { useGetWeatherQuery } = weatherApi;
