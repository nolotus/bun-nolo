import { WeatherQueryParams } from ".";
import { set } from "date-fns";
function getTodayAtFiveAM(): number {
	const now = new Date();
	const todayAtFiveAM = set(now, {
		hours: 5,
		minutes: 0,
		seconds: 0,
		milliseconds: 0,
	});
	return todayAtFiveAM.getTime();
}
export const parseWeatherParams = ({ lat, lng }): WeatherQueryParams => {
	return {
		lat,
		lng,
		start: getTodayAtFiveAM(),
		params: [
			"airTemperature",
			"pressure",
			"cloudCover",
			"currentDirection",
			"currentSpeed",
			"gust",
			"humidity",
			"precipitation",
			"seaLevel",
			"swellDirection",
			"swellHeight",
			"swellPeriod",
			"secondarySwellPeriod",
			"secondarySwellDirection",
			"secondarySwellHeight",
			"visibility",
			"waterTemperature",
			"waveDirection",
			"waveHeight",
			"wavePeriod",
			"windWaveDirection",
			"windWaveHeight",
			"windWavePeriod",
			"windDirection",
			"windSpeed",
		],
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
