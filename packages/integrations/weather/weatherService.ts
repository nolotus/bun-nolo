import { WeatherQueryParams, WeatherApiResponse } from "./weatherTypes";

const WEATHER_API_URL = "https://api.stormglass.io/v2/weather/point";

export const fetchWeatherData = async ({
  lat,
  lng,
  params,
  start,
  end,
  source,
}: WeatherQueryParams): Promise<WeatherApiResponse> => {
  const paramString = params.join(",");

  const query = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
    params: paramString,
  });

  if (start) {
    query.append("start", start);
  }
  if (end) {
    query.append("end", end);
  }
  if (source) {
    query.append("source", source);
  }

  const queryString = query.toString();

  try {
    const key = process.env.WEATHER_API_KEY;
    const response = await fetch(`${WEATHER_API_URL}?${queryString}`, {
      headers: {
        Authorization: key,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch weather data, status: ${response.status}`,
      );
    }

    return response.json();
  } catch (error) {
    console.error("错误发生在fetchWeatherData中", error);
    throw error; // 这里保留抛出错误，以便可以在函数调用者那里捕获异常
  }
};
