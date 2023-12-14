import clsx from "clsx";
import React, { useState } from "react";
import { WeatherDisplay } from "./WeatherDisplay";
import { modes } from "../config";
import { ModeButton, IntervalButton } from "./Buttons";
import useSurfSpot from "../useSurfSpot";
import { transformStyles } from "utils/styles/transformStyles";
import { styles as extraStyles } from "../styles/container";

const webStyles = transformStyles(extraStyles);

const SurfSpotPage = ({ data }) => {
	const { lat, lng } = data;

	const { mode, interval, handleModeChange, handleIntervalChange } =
		useSurfSpot();

	return (
		<div className="mx-auto max-w-full">
			<h1 className="text-2xl font-bold text-gray-900 my-6">{data.title}</h1>
			<div className="mb-4">
				<p className="text-gray-700">经度：{lat}</p>
				<p className="text-gray-700">纬度：{lng}</p>
			</div>
			<div style={webStyles.buttonContainer}>
				<div style={webStyles.intervalButtonGroup}>
					{/* 使用IntervalButton组件 */}
					<IntervalButton
						title="1h"
						isActive={interval === 1}
						onIntervalChange={() => handleIntervalChange(1)}
					/>
					<IntervalButton
						title="3h"
						isActive={interval === 3}
						onIntervalChange={() => handleIntervalChange(3)}
					/>
				</div>

				<div style={webStyles.modeButtonGroup}>
					{modes.map((item) => (
						<ModeButton
							key={item.value}
							modeValue={item.value}
							title={item.title}
							isActive={mode === item.value}
							onModeChange={handleModeChange}
						/>
					))}
				</div>
			</div>
			<div className="w-full">
				<WeatherDisplay lat={lat} lng={lng} mode={mode} interval={interval} />
			</div>
		</div>
	);
};
export default SurfSpotPage;
