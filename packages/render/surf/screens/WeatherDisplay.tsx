import { parseWeatherParams, useGetWeatherQuery } from "integrations/weather";
import { Loader } from "ui/screens/Loader";
import { LineChart } from "react-native-gifted-charts";

import WeatherTable from "./WeatherTable";

export const WeatherDisplay = ({ lat, lng, mode, interval = 3 }) => {
  const queryParams = parseWeatherParams({ lat, lng });

  const {
    data: weatherData,
    error,
    isLoading,
  } = useGetWeatherQuery(queryParams);
  console.log("weatherData", weatherData);
  const lineData = [{ value: 15 }, { value: 30 }, { value: 26 }, { value: 40 }];
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

        <LineChart
          areaChart
          curved
          hideDataPoints
          startFillColor="rgb(46, 217, 255)"
          startOpacity={0.8}
          endFillColor="rgb(203, 241, 250)"
          endOpacity={0.3}
          data={lineData}
        />
      </>
    );
  }
};
