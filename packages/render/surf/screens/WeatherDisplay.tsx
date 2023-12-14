import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { parseWeatherParams, useGetWeatherQuery } from "integrations/weather";
import { formatTime, calculateAverage, getQualityColor } from "../weatherUtils";

import Octicons from "react-native-vector-icons/Octicons";

const WeatherDisplay = ({ lat, lng, mode, interval = 3 }) => {
	const queryParams = parseWeatherParams({ lat, lng });
	const {
		data: weatherData,
		isLoading,
		error,
	} = useGetWeatherQuery(queryParams);

	const getDataByMode = (hour, field) => {
		return hour[field]?.[mode] ? `${hour[field][mode].toFixed(1)}` : "-";
	};

	const dataQualityStyle = (value, type) => ({
		backgroundColor: getQualityColor(value, type),
	});
	if (weatherData) {
		const groupedWeatherData = weatherData?.hours.reduce((acc, hour) => {
			const { monthDay, hourMinute } = formatTime(hour.time);
			if (!acc[monthDay]) {
				acc[monthDay] = [];
			}
			acc[monthDay].push({ ...hour, hourMinute });
			return acc;
		}, {});
		return (
			<View style={styles.topContainer}>
				<View style={styles.labelsContainer}>
					<Text style={styles.labelText}>日期</Text>
					<Text style={styles.labelText}>时间</Text>
					<Text style={styles.labelText}>浪向</Text>
					<Text style={styles.labelText}>风向</Text>
					<Text style={styles.labelText}>风速</Text>
					<Text style={styles.labelText}>浪高</Text>
					<Text style={styles.labelText}>周期</Text>
					<Text style={styles.labelText}>阵风</Text>
				</View>
				<ScrollView horizontal style={styles.container}>
					<View style={styles.daysRowContainer}>
						{isLoading ? (
							<View style={styles.loadingContainer}>
								<Text style={styles.loadingText}>正在加载天气数据...</Text>
							</View>
						) : (
							Object.entries(groupedWeatherData).map(([monthDay, hours]) => {
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
									<View key={monthDay} style={styles.dayContainer}>
										<Text style={styles.dataText}>
											{monthDay}
											{`气温：${avgAirTemperature}°C 水温：${avgWaterTemperature}°C`}
										</Text>
										<View style={styles.hoursContainer}>
											{hours
												.filter((_, index) => index % interval === 0)
												.map((hour, hourIndex) => (
													<View
														key={`${monthDay}-${hourIndex}`}
														style={styles.hourContainer}
													>
														<Text style={styles.dataText}>
															{hour.hourMinute}
														</Text>
														<Text style={styles.dataText}>
															<View>
																<Octicons
																	name="arrow-down"
																	size={16}
																	color="#4a4a4a"
																	style={{
																		transform: [
																			{
																				rotate: `${hour.swellDirection[mode]}deg`,
																			},
																		],
																	}}
																/>
															</View>
														</Text>
														<Text style={styles.dataText}>
															<View>
																<Octicons
																	name="arrow-down"
																	size={16}
																	color="#4a4a4a"
																	style={{
																		transform: [
																			{
																				rotate: `${hour.windDirection[mode]}deg`,
																			},
																		],
																	}}
																/>
															</View>
														</Text>
														<View
															style={[
																styles.dataWrapper,
																dataQualityStyle(
																	getDataByMode(hour, "windSpeed"),
																	"windSpeed",
																),
															]}
														>
															<Text style={styles.dataText}>
																{getDataByMode(hour, "windSpeed")}
															</Text>
														</View>
														<View
															style={[
																styles.dataWrapper,
																dataQualityStyle(
																	getDataByMode(hour, "swellHeight"),
																	"swellHeight",
																),
															]}
														>
															<Text style={styles.dataText}>
																{getDataByMode(hour, "swellHeight")}
															</Text>
														</View>
														<View
															style={[
																styles.dataWrapper,
																dataQualityStyle(
																	getDataByMode(hour, "swellPeriod"),
																	"swellPeriod",
																),
															]}
														>
															<Text style={styles.dataText}>
																{getDataByMode(hour, "swellPeriod")}
															</Text>
														</View>

														<Text style={styles.dataText}>
															{getDataByMode(hour, "gust")}
														</Text>
													</View>
												))}
										</View>
									</View>
								);
							})
						)}
					</View>
				</ScrollView>
			</View>
		);
	}
};

const styles = StyleSheet.create({
	topContainer: {
		flexDirection: "row",
	},
	labelsContainer: {
		width: 60, // 减小宽度使得布局更紧凑
		paddingVertical: 4, // 减小垂直内边距
		backgroundColor: "#f0f0f0", // 一个较为清新的灰色调
	},
	labelText: {
		marginBottom: 6, // 减小标签底部边距
		fontWeight: "600", // 加粗字体，使用600而不是bold来保持清晰度
		fontSize: 14, // 减小字体大小以适应更紧凑的布局
		lineHeight: 20, // 减小行高以适应更小的字体
	},
	dataText: {
		fontSize: 14, // 与labelText的字体大小一致
		lineHeight: 20, // 调整行高以保证对齐
		textAlign: "center", // 文本水平居中对齐
		marginBottom: 6, // 减小数据间底部边距
	},
	container: {
		flex: 1,
		backgroundColor: "#ffffff",
	},
	daysRowContainer: {
		flexDirection: "row",
	},
	dayContainer: {
		flexDirection: "column",
		alignItems: "flex-start", // 子视图左对齐
		paddingVertical: 2, // 减小容器的垂直内边距
	},
	hoursContainer: {
		flexDirection: "row",
	},
	hourContainer: {
		width: 50, // 减小宽度与标签容器对齐
		alignItems: "center",
		paddingVertical: 2, // 减小容器的垂直内边距
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	loadingText: {
		fontSize: 18,
		color: "#007bff",
	},
	icon: {
		textAlign: "center", // 确保文本居中
		transform: [{ rotate: "0deg" }], // 初始设为0度，后面会动态修改
	},
	dataWrapper: {
		justifyContent: "center",
		alignItems: "center",
		minWidth: 50, // 确保背景色可以覆盖足够的空间
		// 其他样式属性按需添加
	},
});

export default WeatherDisplay;
