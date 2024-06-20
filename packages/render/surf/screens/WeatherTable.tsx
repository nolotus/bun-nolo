import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { calculateAverage, getQualityColor } from "../weatherUtils";
import { format } from "date-fns";
import { zhCN } from "date-fns/locale";

import Octicons from "react-native-vector-icons/Octicons";
import { defaultDisplayConfig } from "../config";
import { SurfWeatherLabelCol } from "./SurfWeatherLabelCol";
import { CELL_HEIGHT } from "./style";

export const formatTime = (timeString) => {
  const time = new Date(timeString);
  return {
    monthDay: format(time, "MM/dd", { locale: zhCN }),
    hourMinute: format(time, "HH", { locale: zhCN }),
  };
};

const dataQualityStyle = (value, type) => ({
  backgroundColor: getQualityColor(value, type),
});

const WeatherTable = ({ mode, interval = 3, weatherData }) => {
  const getDataByMode = (hour, field) => {
    return hour[field]?.[mode] ? `${hour[field][mode].toFixed(1)}` : "-";
  };
  console.log("weatherData", weatherData);
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
      <SurfWeatherLabelCol />
      <ScrollView horizontal style={styles.container}>
        <View style={styles.daysRowContainer}>
          {Object.entries(groupedWeatherData).map(([monthDay, hours]) => {
            const avgWaterTemperature = calculateAverage(
              hours,
              "waterTemperature",
              mode,
            );
            return (
              <View key={monthDay} style={styles.dayContainer}>
                <Text style={styles.dataText}>
                  {monthDay} {`水温：${avgWaterTemperature}°C`}
                </Text>
                <View style={styles.hoursContainer}>
                  {hours
                    .filter((_, index) => index % interval === 0)
                    .map((hour, hourIndex) => (
                      <View
                        key={`${monthDay}-${hourIndex}`}
                        style={styles.hourContainer}
                      >
                        {defaultDisplayConfig.map((config) => {
                          if (!config.enabled) {
                            return null;
                          }

                          const value = getDataByMode(hour, config.key);
                          let component = null;

                          switch (config.key) {
                            case "windSpeed":
                            case "swellHeight":
                            case "swellPeriod":
                              // 使用数据质量背景的数据项
                              const qualityStyle = dataQualityStyle(
                                value,
                                config.key,
                              );
                              component = (
                                <View
                                  key={`${monthDay}-${hourIndex}-${config.key}`}
                                  style={[styles.dataWrapper, qualityStyle]}
                                >
                                  <Text style={styles.dataText}>{value}</Text>
                                </View>
                              );
                              break;
                            case "swellDirection":
                            case "windDirection":
                              component = (
                                <View
                                  key={`${monthDay}-${hourIndex}-${config.key}`}
                                  style={styles.dataWrapper}
                                >
                                  <Octicons
                                    name="arrow-down"
                                    size={16}
                                    color="#4a4a4a"
                                    style={{
                                      transform: [{ rotate: `${value}deg` }],
                                    }}
                                  />
                                </View>
                              );
                              break;
                            case "time":
                              const hourFormatted = format(
                                new Date(hour.time),
                                "HH",
                                { locale: zhCN },
                              );
                              component = (
                                <Text
                                  key={`${monthDay}-${hourIndex}-${config.key}`}
                                  style={styles.dataText}
                                >
                                  {hourFormatted}
                                </Text>
                              );
                              break;
                            default:
                              component = (
                                <Text
                                  key={`${monthDay}-${hourIndex}-${config.key}`}
                                  style={styles.dataText}
                                >
                                  {value}
                                </Text>
                              );
                              break;
                          }

                          return component;
                        })}
                      </View>
                    ))}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    flexDirection: "row",
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
    minWidth: 50,
    height: CELL_HEIGHT,
  },
});

export default WeatherTable;
