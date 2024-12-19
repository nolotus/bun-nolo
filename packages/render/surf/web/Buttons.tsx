import type React from "react";
import { twMerge } from "tailwind-merge"; // 导入tailwind-merge

import * as styles from "../styles/ToggleButtonStyles";

interface ToggleButtonProps {
	value: string | number;
	title: string;
	isActive: boolean;
	onPress: (value: string | number) => void;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({
	value,
	title,
	isActive,
	onPress,
}) => {
	const buttonClasses = twMerge(
		styles.baseButton,
		isActive && styles.activeButton,
	);
	const textClasses = twMerge(styles.baseText, isActive && styles.activeText);

	return (
		<button
			type="button"
			className={buttonClasses}
			onClick={() => onPress(value)}
		>
			<span className={textClasses}>{title}</span>
		</button>
	);
};

export default ToggleButton;
