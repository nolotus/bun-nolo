import React from "react";
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
	const buttonClasses = `${styles.baseButton} ${
		isActive ? styles.activeButton : ""
	}`;

	// 使用textClasses为标题文本应用样式
	const textClasses = `${styles.baseText} ${isActive ? styles.activeText : ""}`;

	return (
		<button
			type="button"
			className={buttonClasses}
			onClick={() => onPress(value)}
		>
			{/* 应用textClasses的span标签包裹标题文本 */}
			<span className={textClasses}>{title}</span>
		</button>
	);
};

export default ToggleButton;
