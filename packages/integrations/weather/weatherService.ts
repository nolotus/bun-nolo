import { WeatherQueryParams, WeatherApiResponse } from "./weatherTypes";
import { nolotusId } from "core/init";
import { queryData } from "database/query/queryHandler";

const WEATHER_API_URL = "https://api.stormglass.io/v2/weather/point";

export const queryWeatherCache = async (lat, lng, start, end) => {
  const result = await queryData({
    userId: nolotusId,
    isJSON: true,
    condition: {
      lat: lat,
      lng: lng,
      // 假设 created_at 是保存数据的时间戳字段
      // 需要数据库查询API支持下面的格式来过滤时间范围
      created_at: {
        $gte: start, // $gte 表示大于等于 start
        $lte: end, // $lte 表示小于等于 end
      },
    },
  });
  return result;
};
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
    throw error; // 这里保留抛出错误，以便可以在函数调用者那里捕获异常
  }
};
