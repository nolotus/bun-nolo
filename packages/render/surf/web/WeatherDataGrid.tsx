import React from "react";
import { ArrowDownIcon } from "@primer/octicons-react";
import { calculateAverage, getQualityColor } from "../weatherUtils";
import { iconContainerStyle, outerDivStyle } from "../WeatherIconStyles";
import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
type WeatherDataGridProps = {
	groupedWeatherData: Record<string, any[]>;
	interval: number;
	mode: string;
};
const getDayOfWeekShort = (dateStr: string): string => {
	const date = parseISO(dateStr);
	return format(date, "eee", { locale: zhCN }); // 使用‘eee’来获取简短的星期名称
};
const getMonthDayAndWeekday = (dateStr: string): string => {
	const date = parseISO(dateStr); // 将字符串转换为日期对象
	// 使用‘MM-dd’来获取月和日，‘eee’来获取简短的星期名称
	return format(date, "MM-dd eee", { locale: zhCN });
};
const WeatherDataGrid: React.FC<WeatherDataGridProps> = ({
	groupedWeatherData,
	interval,
	mode,
}) => {
	const getDataByMode = (hour, field) => {
		return hour[field]?.[mode] ? `${hour[field][mode].toFixed(1)}` : "-";
	};

	const getBackgroundColorStyle = (value: string, type: string) => {
		const numericValue = parseFloat(value);
		if (Number.isNaN(numericValue)) {
			return {};
		}
		const colorValue = getQualityColor(numericValue, type);
		return { backgroundColor: colorValue };
	};

	const getRotationStyle = (rotationValue: string) => ({
		...iconContainerStyle,
		transform: `rotate(${rotationValue}deg)`,
	});

	return (
		<div className="col-span-1 overflow-x-auto w-full">
			<div className="grid grid-flow-col">
				{Object.entries(groupedWeatherData).map(([monthDay, hours]) => {
					const avgAirTemperature = calculateAverage(
						hours,
						"airTemperature",
						mode,
					);
					const avgWaterTemperature = calculateAverage(
						hours,
						"waterTemperature",
						mode,
					);

					return (
						<React.Fragment key={monthDay}>
							<div key={monthDay} className="flex flex-col">
								<div className="sticky top-0 z-10 bg-white opacity-90 bg-blue-50 flex flex-row justify-start items-center space-x-3 p-2 rounded-lg shadow-sm">
									<div className="text-gray-800 h-6 font-semibold text-blue-700 flex-shrink-0 text-xs">
										{getMonthDayAndWeekday(monthDay)}
									</div>
									<div className="text-gray-800 h-6 text-red-500 text-xs">
										{`气温: ${avgAirTemperature}°C`}
									</div>
									<div className="text-gray-800 h-6 text-blue-500 text-xs">
										{`水温: ${avgWaterTemperature}°C`}
									</div>
								</div>
								<div
									className={`col-span-${
										hours.length / interval
									} grid grid-flow-col`}
								>
									{hours.reduce((acc, hour, index) => {
										if (index % interval === 0) {
											acc.push(
												<div
													key={`${monthDay}-${index}`}
													className="min-w-max flex flex-col"
													style={{ flex: "1 0 auto" }}
												>
													<div className="text-gray-800 h-6 font-semibold text-green-600">
														{format(parseISO(hour.time), "HH", {
															locale: zhCN,
														})}
													</div>
													<div style={outerDivStyle}>
														<div
															style={getRotationStyle(
																getDataByMode(hour, "windDirection"),
															)}
														>
															<ArrowDownIcon size={16} />
														</div>
													</div>
													<div style={outerDivStyle}>
														<div
															style={getRotationStyle(
																getDataByMode(hour, "swellDirection"),
															)}
														>
															<ArrowDownIcon size={16} />
														</div>
													</div>
													<div
														style={getBackgroundColorStyle(
															getDataByMode(hour, "swellHeight"),
															"swellHeight",
														)}
														className="text-gray-600 text-sm py-1 px-2"
													>
														{getDataByMode(hour, "swellHeight")}
													</div>
													<div
														style={getBackgroundColorStyle(
															getDataByMode(hour, "swellPeriod"),
															"swellPeriod",
														)}
														className="text-gray-600 text-sm py-1 px-2"
													>
														{getDataByMode(hour, "swellPeriod")}
													</div>
													<div
														style={{
															backgroundColor: getQualityColor(
																getDataByMode(hour, "windSpeed"),
																"windSpeed",
															),
														}}
														className="text-gray-600 text-sm py-1 px-2"
													>
														{getDataByMode(hour, "windSpeed")}
													</div>
													<div className="text-gray-600 text-sm py-1 px-2">
														{getDataByMode(hour, "gust")}
													</div>
												</div>,
											);
										}
										return acc;
									}, [])}
								</div>
							</div>
						</React.Fragment>
					);
				})}
			</div>
		</div>
	);
};

export default WeatherDataGrid;
