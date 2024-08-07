import React, { Suspense, useState } from "react";
import { calculateAverage, getQualityColor } from "../weatherUtils";
import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";

import { SurfTideChart } from "./Chart";
import DirectionArrow from "./DirectionArrow";
import {
  extractTimeAndSwellHeight,
  groupHourlyWeatherByLocalDate,
} from "../utils/groupedWeatherData";
type WeatherDataGridProps = {
  groupedWeatherData: Record<string, any[]>;
  interval: number;
  mode: string;
};

const getMonthDayAndWeekday = (dateStr: string): string => {
  const date = parseISO(dateStr); // 将字符串转换为日期对象
  // 使用‘MM-dd’来获取月和日，‘eee’来获取简短的星期名称
  return format(date, "MM-dd eee", { locale: zhCN });
};

const WeatherDataGrid: React.FC<WeatherDataGridProps> = ({
  interval,
  mode,
  hours,
}) => {
  const groupedWeatherData = groupHourlyWeatherByLocalDate(hours);

  const tideChartData = extractTimeAndSwellHeight(hours);

  const { x, y } = tideChartData;

  const [hideNightTime, setHideNightTime] = useState(true);

  // const toggleNightTime = () => {
  //   setHideNightTime(!hideNightTime);
  // };

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

  const hourIsVisible = (hour) => {
    const hourNumber = format(parseISO(hour.time), "HH", {
      locale: zhCN,
    });
    if (hideNightTime) {
      return hourNumber < 20 && hourNumber >= 4;
    }
    return true;
  };

  return (
    <div className="col-span-1 w-full overflow-x-auto">
      <div className="grid grid-flow-col">
        {Object.entries(groupedWeatherData).map(([monthDay, hours]) => {
          const avgWaterTemperature = calculateAverage(
            hours,
            "waterTemperature",
            mode,
          );

          return (
            <React.Fragment key={monthDay}>
              <div key={monthDay} className="flex flex-col">
                <div className="h-6">
                  {getMonthDayAndWeekday(monthDay)}

                  {`水温: ${avgWaterTemperature}°C`}
                </div>
                <div
                  className={`col-span-${
                    hours.length / interval
                  }  grid grid-flow-col`}
                >
                  {hours.reduce((acc, hour, index) => {
                    if (index % interval === 0 && hourIsVisible(hour)) {
                      acc.push(
                        <div
                          key={`${monthDay}-${index}`}
                          className="flex min-w-max flex-col"
                          style={{ flex: "1 0 auto" }}
                        >
                          <div className="h-6 font-semibold text-gray-800 text-green-600">
                            {format(parseISO(hour.time), "HH", {
                              locale: zhCN,
                            })}
                          </div>
                          <DirectionArrow
                            rotationValue={getDataByMode(hour, "windDirection")}
                          />
                          <DirectionArrow
                            rotationValue={getDataByMode(
                              hour,
                              "swellDirection",
                            )}
                          />
                          <div
                            style={getBackgroundColorStyle(
                              getDataByMode(hour, "swellHeight"),
                              "swellHeight",
                            )}
                            className="px-2 py-1 text-sm text-gray-600"
                          >
                            {getDataByMode(hour, "swellHeight")}
                          </div>
                          <div
                            style={getBackgroundColorStyle(
                              getDataByMode(hour, "swellPeriod"),
                              "swellPeriod",
                            )}
                            className="px-2 py-1 text-sm text-gray-600"
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
                            className="px-2 py-1 text-sm text-gray-600"
                          >
                            {getDataByMode(hour, "windSpeed")}
                          </div>
                          <div className="px-2 py-1 text-sm text-gray-600">
                            {getDataByMode(hour, "gust")}
                          </div>
                          <div className="px-2 py-1 text-sm text-gray-600">
                            {getDataByMode(hour, "airTemperature")}
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
      <Suspense>
        <SurfTideChart x={x} y={y} style={{ width: "2060px" }} />
      </Suspense>
    </div>
  );
};

export default WeatherDataGrid;
