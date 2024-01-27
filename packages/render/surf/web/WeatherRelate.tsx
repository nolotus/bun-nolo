import ToggleButton from "./Buttons";
import { WeatherDisplay } from "./WeatherDisplay";
import { modes, intervals } from "../config";
import useSurfSpot from "../useSurfSpot";

export const WeatherRelate = ({ lat, lng }) => {
  const { mode, interval, handleModeChange, handleIntervalChange } =
    useSurfSpot();

  return (
    <>
      <div className="mb-4 mt-4 flex w-full flex-row items-center justify-between">
        <div className="flex-frow flex flex-row" style={{ flex: "0.2" }}>
          {intervals.map((intervalItem) => (
            <ToggleButton
              key={intervalItem.value}
              value={intervalItem.value}
              title={intervalItem.title}
              isActive={interval === intervalItem.value}
              onPress={() => handleIntervalChange(intervalItem.value)}
            />
          ))}
        </div>

        <div className="flex flex-row" style={{ flex: 0.6 }}>
          {modes.map((item) => (
            <ToggleButton
              key={item.value}
              value={item.value}
              title={item.title}
              isActive={mode === item.value}
              onPress={handleModeChange}
            />
          ))}
        </div>
      </div>
      <div className="w-full">
        <WeatherDisplay lat={lat} lng={lng} mode={mode} interval={interval} />
      </div>
    </>
  );
};
