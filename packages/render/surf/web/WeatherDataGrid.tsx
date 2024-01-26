import React from "react";
import { calculateAverage, getQualityColor } from "../weatherUtils";
import { format, parseISO } from "date-fns";
import { zhCN } from "date-fns/locale";
import DirectionArrow from "./DirectionArrow";

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
                <div className="sticky top-0 z-10 flex flex-row items-center justify-start space-x-3 rounded-lg bg-white p-1 opacity-90 shadow-sm">
                  <div className="h-6 flex-shrink-0 text-xs font-semibold text-blue-700 text-gray-800">
                    {getMonthDayAndWeekday(monthDay)}
                  </div>

                  <div className="h-6 text-xs text-blue-500 text-gray-800">
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
    </div>
  );
};

export default WeatherDataGrid;
