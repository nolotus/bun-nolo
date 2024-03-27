import { API_ENDPOINTS } from "database/config";

import { WeatherQueryParams, WeatherApiResponse } from "./weatherTypes";
export async function getWeather(
  params: WeatherQueryParams,
): Promise<WeatherApiResponse> {
  const searchParams = new URLSearchParams({
    lat: params.lat.toString(),
    lng: params.lng.toString(),
    params: params.params.join(","),
    ...(params.start && { start: params.start }),
    ...(params.end && { end: params.end }),
    ...(params.source && { source: params.source }),
  }).toString();

  const response = await fetch(`${API_ENDPOINTS.WEATHER}?${searchParams}`);

  if (!response.ok) {
    // 如果响应状态不是2xx，抛出错误
    throw new Error("Network response was not ok");
  }

  return response.json();
}
