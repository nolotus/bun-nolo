import { useEffect, useRef } from "react";
import { parseWeatherParams, useGetWeatherQuery } from "integrations/weather";
import { Loader } from "render/ui/screens/Loader";
import * as echarts from "echarts/core";
import Chart from "./Chart";
import WeatherTable from "./WeatherTable";

export const WeatherDisplay = ({ lat, lng, mode, interval = 3 }) => {
  const queryParams = parseWeatherParams({ lat, lng });
  const skiaRef = useRef<any>(null);

  useEffect(() => {
    const option = {
      xAxis: {
        type: "category",
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          data: [150, 230, 224, 218, 135, 147, 260],
          type: "line",
        },
      ],
    };
    let chart: any;
    if (skiaRef.current) {
      chart = echarts.init(skiaRef.current, "light", {
        renderer: "svg",
        width: 400,
        height: 400,
      });
      chart.setOption(option);
    }
    return () => chart?.dispose();
  }, []);
  const {
    data: weatherData,
    error,
    isLoading,
  } = useGetWeatherQuery(queryParams);
  console.log("weatherData", weatherData);
  if (isLoading) {
    return <Loader />;
  }
  if (weatherData) {
    return (
      <>
        <WeatherTable
          mode={mode}
          interval={interval}
          weatherData={weatherData}
        />
        <Chart />
      </>
    );
  }
};
