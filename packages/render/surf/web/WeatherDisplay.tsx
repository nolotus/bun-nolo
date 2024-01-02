import { parseWeatherParams, useGetWeatherQuery } from "integrations/weather";
import React from "react";
import LabelsColumn from "./LabelsColumn";
import { parseISO, format } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";
import WeatherDataGrid from "./WeatherDataGrid";
const headerCellStyle = "text-gray-600 truncate h-6";
const dateCellStyle = "text-gray-800 h-6";
const stickyCellStyle = "sticky top-0 z-10 bg-white opacity-90";

export const WeatherDisplay = ({ lat, lng, mode, interval = 3 }) => {
	const queryParams = parseWeatherParams({ lat, lng });
	const {
		data: weatherData,
		error,
		isLoading,
		isSuccess,
	} = useGetWeatherQuery(queryParams);
	const containerStyle = isLoading
		? "grid grid-cols-1 bg-white shadow"
		: "grid grid-cols-[minmax(auto,70px)_1fr] bg-white shadow";

	const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	const groupedWeatherData = weatherData?.hours.reduce(
		(acc: Record<string, any[]>, hour) => {
			const isoDate = hour.time.split("T")[0]; // 获取 ISO 日期部分
			const date = parseISO(hour.time); // 转换成 JS 日期对象
			const zonedDate = utcToZonedTime(date, timeZone); // 转换到当地时区时间
			const localDate = format(zonedDate, "yyyy-MM-dd", { timeZone }); // 按当地时区格式化日期

			if (!acc[localDate]) {
				acc[localDate] = [];
			}
			acc[localDate].push(hour);

			return acc;
		},
		{},
	);

	if (isLoading) {
		return (
			<div className="flex justify-center items-center w-full h-full">
				<div className="text-lg text-blue-500">正在加载天气数据...</div>
			</div>
		);
	}
	return (
		<div className={containerStyle}>
			<LabelsColumn
				stickyCellStyle={stickyCellStyle}
				dateCellStyle={dateCellStyle}
				headerCellStyle={headerCellStyle}
			/>
			<WeatherDataGrid
				groupedWeatherData={groupedWeatherData}
				interval={interval}
				mode={mode}
			/>
		</div>
	);
};
