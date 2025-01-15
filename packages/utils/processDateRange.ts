import { format, subDays, eachDayOfInterval } from "date-fns";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";

export type TimeRange = "7days" | "30days" | "90days";

export const processDateRange = (timeRange: TimeRange, userTimeZone) => {
  // 获取用户时区的当前时间
  const endLocal = utcToZonedTime(new Date(), userTimeZone);
  const days = timeRange === "7days" ? 7 : timeRange === "30days" ? 30 : 90;
  const startLocal = subDays(endLocal, days - 1);

  // 生成用户时区的日期数组
  const dateArray = eachDayOfInterval({ start: startLocal, end: endLocal });

  // 转换为UTC时间用于API查询
  const startUTC = zonedTimeToUtc(startLocal, userTimeZone);
  const endUTC = zonedTimeToUtc(endLocal, userTimeZone);

  return {
    startUTC,
    endUTC,
    dateArray: dateArray.map((date) => ({
      // UTC格式用于API查询
      utc: format(zonedTimeToUtc(date, userTimeZone), "yyyy-MM-dd"),
      // 本地格式用于显示
      full: format(date, "yyyy-MM-dd"),
      short: format(date, "MM-dd"),
    })),
  };
};
