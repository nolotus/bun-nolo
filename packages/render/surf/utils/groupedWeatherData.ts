import { parseISO, format } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import { HourlyWeather } from "integrations/weather";

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const groupHourlyWeatherByLocalDate = (hours: HourlyWeather[]) => {
  return hours.reduce((acc: Record<string, any[]>, hour) => {
    const date = parseISO(hour.time); // 转换成 JS 日期对象
    const zonedDate = utcToZonedTime(date, timeZone); // 转换到当地时区时间
    const localDate = format(zonedDate, "yyyy-MM-dd", { timeZone }); // 按当地时区格式化日期

    if (!acc[localDate]) {
      acc[localDate] = [];
    }
    acc[localDate].push(hour);

    return acc;
  }, {});
};
export const extractTimeAndSwellHeight = (
  hourlyWeatherArray: HourlyWeather[],
) => {
  let times = []; // 时间数组
  let SwellHeights = []; // 浪高数组

  for (const weather of hourlyWeatherArray) {
    times.push(weather.time); // 将时间添加到时间数组
    SwellHeights.push(weather.swellHeight?.sg || 0); // 将浪高添加到浪高数组，若无浪高数据，使用0替代
  }

  return { x: times, y: SwellHeights };
};
