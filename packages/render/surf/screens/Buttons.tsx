// ToggleButton.mobile.tsx
import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { style as tw } from "twrnc";
import * as styles from "../styles/ToggleButtonStyles"; // 导入共享的样式字符串

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
	const buttonStyle = tw(styles.baseButton, isActive && styles.activeButton);

	const textStyle = tw(styles.baseText, isActive && styles.activeText);

	return (
		<TouchableOpacity style={buttonStyle} onPress={() => onPress(value)}>
			<Text style={textStyle}>{title}</Text>
		</TouchableOpacity>
	);
};

export default ToggleButton;
