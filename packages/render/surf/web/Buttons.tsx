import { transformStyles, combineStyles } from "utils/styles/transformStyles";
import { buttonStyles } from "../styles/button";

const webStyles = transformStyles(buttonStyles);

export const ModeButton = ({ modeValue, title, isActive, onModeChange }) => (
	<div
		style={combineStyles([
			webStyles.modeButton,
			isActive && webStyles.modeButtonActive,
		])}
		onClick={() => onModeChange(modeValue)}
	>
		<div
			style={combineStyles([
				webStyles.modeButtonText,
				isActive && webStyles.modeButtonTextActive,
			])}
		>
			{title}
		</div>
	</div>
);

export const IntervalButton = ({ title, isActive, onIntervalChange }) => (
	<div
		style={combineStyles([
			webStyles.intervalButton,
			isActive && webStyles.intervalButtonSelected,
		])}
		onClick={onIntervalChange}
	>
		<div
			style={combineStyles([
				webStyles.intervalButtonText,
				isActive && webStyles.intervalButtonTextSelected,
			])}
		>
			{title}
		</div>
	</div>
);
