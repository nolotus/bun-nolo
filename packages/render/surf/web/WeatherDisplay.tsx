import React from "react";

import LabelsColumn from "./LabelsColumn";
import WeatherDataGrid from "./WeatherDataGrid";

export const WeatherDisplay = ({ mode, interval = 3, data }) => {
  const containerStyle = "grid grid-cols-[minmax(auto,70px)_1fr]";

  return (
    <div className={containerStyle}>
      <LabelsColumn />
      {data && (
        <WeatherDataGrid
          groupedWeatherData={data}
          interval={interval}
          mode={mode}
        />
      )}
    </div>
  );
};
