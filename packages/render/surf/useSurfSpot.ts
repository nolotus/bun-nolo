// useSurfSpot.ts
import { useState } from "react";
import { modes, intervals } from "./config"; // 确保路径正确

const useSurfSpot = () => {
	const initialMode = modes[0].value; // 默认取配置数组的第一个模式的值
	const initialInterval = intervals[0].value; // 默认取配置数组的第一个间隔的值

	const [mode, setMode] = useState(initialMode);
	const [interval, setInterval] = useState(initialInterval);

	const handleModeChange = (newMode) => {
		setMode(newMode);
	};
	const handleIntervalChange = (newInterval) => {
		setInterval(newInterval);
	};

	return {
		mode,
		interval,
		handleModeChange,
		handleIntervalChange,
	};
};

export default useSurfSpot;
