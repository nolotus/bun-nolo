import { format, parseISO } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import type { HourlyWeather } from "integrations/weather";

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
	const times = [];
	const SwellHeights = [];

	for (const weather of hourlyWeatherArray) {
		times.push(weather.time);
		SwellHeights.push(weather.waveHeight?.sg || 0);
	}

	return { x: times, y: SwellHeights };
};
