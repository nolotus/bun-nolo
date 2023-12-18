import React from "react";
import { Text, TouchableOpacity, StyleSheet } from "react-native";

// Heading组件，可根据等级(level)显示不同的样式
const Heading = ({ level, children, style }) => {
	let headingStyle;
	switch (level) {
		case 1:
			headingStyle = styles.heading1;
			break;
		case 2:
			headingStyle = styles.heading2;
			break;
		// ...可以根据实际需要添加更多的级别
		default:
			headingStyle = styles.headingDefault;
	}

	return <Text style={[headingStyle, style]}>{children}</Text>;
};

const Link = ({ href, children, style }) => (
	// 注意：在移动端，通常会用react-navigation的navigation来进行页面跳转，此处作为简单示例使用TouchableOpacity
	<TouchableOpacity
		onPress={() => console.log(`Attempting to open link: ${href}`)}
	>
		<Text style={[styles.link, style]}>{children}</Text>
	</TouchableOpacity>
);

const Paragraph = ({ children, style }) => (
	<Text style={[styles.paragraph, style]}>{children}</Text>
);

const Strong = ({ children, style }) => (
	<Text style={[styles.strong, style]}>{children}</Text>
);

// 以下为组件的样式定义
const styles = StyleSheet.create({
	heading1: {
		fontSize: 24,
		fontWeight: "bold",
		marginVertical: 4,
	},
	heading2: {
		fontSize: 20,
		fontWeight: "bold",
		marginVertical: 4,
	},
	// ...可以为其他标题等级添加样式
	headingDefault: {
		fontSize: 16,
		fontWeight: "bold",
		marginVertical: 4,
	},
	link: {
		color: "blue",
		textDecorationLine: "underline",
	},
	paragraph: {
		fontSize: 16,
		marginVertical: 4,
	},
	strong: {
		fontWeight: "bold",
	},
});

export { Heading, Link, Paragraph, Strong };
