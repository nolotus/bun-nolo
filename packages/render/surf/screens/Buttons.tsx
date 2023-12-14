import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { buttonStyles } from "../styles/button";
export const ModeButton = ({ modeValue, title, isActive, onModeChange }) => (
	<TouchableOpacity
		style={[styles.modeButton, isActive && styles.modeButtonActive]}
		onPress={() => onModeChange(modeValue)}
	>
		<Text
			style={[styles.modeButtonText, isActive && styles.modeButtonTextActive]}
		>
			{title}
		</Text>
	</TouchableOpacity>
);

export const IntervalButton = ({ title, isActive, onIntervalChange }) => (
	<TouchableOpacity
		style={[styles.intervalButton, isActive && styles.intervalButtonSelected]}
		onPress={onIntervalChange}
	>
		<Text
			style={[
				styles.intervalButtonText,
				isActive && styles.intervalButtonTextSelected,
			]}
		>
			{title}
		</Text>
	</TouchableOpacity>
);

const styles = StyleSheet.create(buttonStyles);
