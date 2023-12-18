import React from "react";
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
} from "react-native";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";

export function HomeScreen() {
	const navigation = useNavigation();
	const mainBackgroundColor = useSelector(
		(state) => state.theme.mainBackgroundColor,
	);

	return (
		<ScrollView
			style={{ backgroundColor: mainBackgroundColor }}
			contentContainerStyle={styles.container}
		>
			<View style={styles.section}>
				<Text style={styles.textDescription}>nolotus.com 的移动端测试版!</Text>
			</View>
			<View style={styles.section}>
				<TouchableOpacity onPress={() => navigation.navigate("Location")}>
					<Text style={styles.linkText}>浪点功能</Text>
				</TouchableOpacity>
			</View>
			<View style={styles.section}>
				<Text style={styles.textDescription}>下一步增加</Text>
				<TouchableOpacity onPress={() => navigation.navigate("Chat")}>
					<Text style={styles.linkText}>AI对话功能</Text>
				</TouchableOpacity>
			</View>
			<View style={styles.section}>
				<Text style={styles.textDescription}>
					无需登录注册也可以使用，你的数据留在手机本地。
				</Text>
				<TouchableOpacity onPress={() => navigation.navigate("User")}>
					<Text style={styles.linkText}>
						如果你需要同步你的数据，请注册或登录使用。
					</Text>
				</TouchableOpacity>
			</View>
			<View style={styles.section}>
				<Text style={styles.textDescription}>下一步功能</Text>
				<TouchableOpacity onPress={() => navigation.navigate("Create")}>
					<Text style={styles.linkText}>创建笔记</Text>
				</TouchableOpacity>
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		justifyContent: "center",
	},
	section: {
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: "#D1D5DB", // 浅灰色，与背景色相协调
		backgroundColor: "#E5E7EB", // 设置为 `mainBackgroundColor`
	},
	textDescription: {
		fontSize: 16,
		color: "#1F2937", // 深灰色/近黑色，确保良好的对比度和阅读性
		textAlign: "center",
		marginVertical: 6,
	},
	linkText: {
		fontSize: 16,
		fontWeight: "600", // 稍微加粗来突出链接
		color: "#3B82F6", // 使用更鲜艳的蓝色调，用于引起注意
		textDecorationLine: "underline",
		textAlign: "center",
		marginVertical: 6,
	},
});
