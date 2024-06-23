import React from "react";

import LabelsColumn from "./LabelsColumn";
import WeatherDataGrid from "./WeatherDataGrid";
export const WeatherDisplay = ({ mode, interval = 3, hours }) => {
  const containerStyle = "grid grid-cols-[minmax(auto,70px)_1fr]";

  return (
    <>
      <div className={containerStyle}>
        <LabelsColumn />
        {hours && (
          <WeatherDataGrid interval={interval} mode={mode} hours={hours} />
        )}
      </div>
    </>
  );
};
