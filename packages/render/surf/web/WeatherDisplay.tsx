import clsx from "clsx";
import { parseWeatherParams, useGetWeatherQuery } from "integrations/weather";
import React, { useEffect, useState } from "react";
import { formatTime, calculateAverage, getQualityColor } from "../weatherUtils";
import { ArrowDownIcon } from "@primer/octicons-react";
import { iconContainerStyle, outerDivStyle } from "../WeatherIconStyles";

const headerCellStyle = "text-gray-600 truncate h-6";
const dateCellStyle = "text-gray-800 h-6";
const stickyCellStyle = "sticky top-0 z-10 bg-white opacity-90";
const gridContainerStyle = "grid grid-flow-col ";
const gridColumnStyle = "min-w-max";
const fontBoldStyle = "font-semibold";

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

	const getDataByMode = (hour, field) => {
		return hour[field]?.[mode] ? `${hour[field][mode].toFixed(1)}` : "-";
	};

	const groupedWeatherData = weatherData?.hours.reduce((acc, hour) => {
		const { monthDay, hourMinute } = formatTime(hour.time);
		if (!acc[monthDay]) {
			acc[monthDay] = [];
		}
		acc[monthDay].push({ ...hour, hourMinute });
		return acc;
	}, {});

	const getBackgroundColorStyle = (value: string, type: string) => {
		const numericValue = parseFloat(value);
		if (isNaN(numericValue)) {
			return {}; // 如果提供的值不是数字，则返回空样式对象
		}
		const colorValue = getQualityColor(numericValue, type);
		return { backgroundColor: colorValue }; // 将颜色设置为样式对象的属性
	};
	return (
		<div className={containerStyle}>
			{isLoading ? (
				<div className="flex justify-center items-center w-full h-full">
					<div className="text-lg text-blue-500">正在加载天气数据...</div>
				</div>
			) : (
				<>
					<div
						className={clsx(
							"col-span-1",
							stickyCellStyle,
							"grid items-center",
							"bg-gray-100",
						)}
					>
						<div className={dateCellStyle}>日期:</div>
						<div className={dateCellStyle}>时间:</div>
						<div className={headerCellStyle}>浪向:</div>
						<div className={headerCellStyle}>风向:</div>
						<div className={headerCellStyle}>浪高(m):</div>
						<div className={headerCellStyle}>周期(s):</div>
						<div className={headerCellStyle}>风速(m/s):</div>
						<div className={headerCellStyle}>阵风(m/s):</div>
					</div>

					<div className="col-span-1 overflow-x-auto w-full">
						<div className={gridContainerStyle}>
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
											<div
												className={clsx(
													stickyCellStyle,
													"bg-blue-50",
													"flex",
													"flex-row",
													"justify-start",
													"items-center",
													"space-x-3",
													"p-2",
													"rounded-lg",
													"shadow-sm",
												)}
											>
												<div
													className={clsx(
														dateCellStyle,
														fontBoldStyle,
														"text-blue-700",
														"flex-shrink-0",
														"text-xs",
													)}
												>
													{monthDay}
												</div>
												<div
													className={clsx(
														dateCellStyle,
														"text-red-500",
														"text-xs",
													)}
												>
													{`气温: ${avgAirTemperature}°C`}
												</div>
												<div
													className={clsx(
														dateCellStyle,
														"text-blue-500",
														"text-xs",
													)}
												>
													{`水温: ${avgWaterTemperature}°C`}
												</div>
											</div>
											<div
												className={`col-span-${
													hours.length / interval
												} ${gridContainerStyle}`}
											>
												{hours
													.filter((_, index) => index % interval === 0)
													.map((hour, hourIndex) => (
														<div
															key={`${monthDay}-${hourIndex}`}
															className={clsx(
																gridColumnStyle,
																"flex",
																"flex-col",
															)}
															style={{ flex: "1 0 auto" }}
														>
															<div
																className={clsx(
																	dateCellStyle,
																	fontBoldStyle,
																	"text-green-600",
																)}
															>
																{hour.hourMinute}
															</div>
															<div style={outerDivStyle}>
																<div
																	style={{
																		...iconContainerStyle,
																		transform: `rotate(${getDataByMode(
																			hour,
																			"swellDirection",
																		)}deg)`,
																	}}
																>
																	<ArrowDownIcon size={16} />
																</div>
															</div>
															<div style={outerDivStyle}>
																<div
																	style={{
																		...iconContainerStyle,
																		transform: `rotate(${getDataByMode(
																			hour,
																			"windDirection",
																		)}deg)`,
																	}}
																>
																	<ArrowDownIcon size={16} />
																</div>
															</div>
															<div
																style={getBackgroundColorStyle(
																	getDataByMode(hour, "swellHeight"),
																	"swellHeight",
																)}
																className="text-gray-600 text-sm"
															>
																{getDataByMode(hour, "swellHeight")}
															</div>
															<div
																style={getBackgroundColorStyle(
																	getDataByMode(hour, "swellPeriod"),
																	"swellPeriod",
																)}
																className="text-gray-600 text-sm"
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
																className="h-6 text-sm"
															>
																{getDataByMode(hour, "windSpeed")}
															</div>
															<div className="text-gray-600 text-sm h-6">
																{getDataByMode(hour, "gust")}
															</div>
														</div>
													))}
											</div>
										</div>
									</React.Fragment>
								);
							})}
						</div>
					</div>
				</>
			)}
		</div>
	);
};
