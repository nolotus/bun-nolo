import React, { useEffect } from "react";
import {
	ScrollView,
	View,
	Text,
	StyleSheet,
	ActivityIndicator,
} from "react-native";
import Card from "./Card";
import { useGetEntriesQuery } from "database/services";
import { nolotusId } from "core/init";
import { DataType } from "create/types";
import { Button } from "react-native";

export function SpotsScreen() {
	const options = {
		isJSON: true,
		condition: {
			$eq: { type: DataType.SurfSpot },
		},
		limit: 20,
	};
	const { data, error, isLoading, isSuccess } = useGetEntriesQuery({
		userId: nolotusId,
		options,
		domain: "nolotus.com",
	});

	if (isLoading) {
		return (
			<View style={styles.loader}>
				<ActivityIndicator size="large" color="#0000ff" />
			</View>
		);
	}

	return (
		<ScrollView style={styles.container}>
			<Text style={styles.headerTitle}>浪点</Text>
			<View style={styles.cardContainer}>
				{data?.map((item) => {
					return (
						<Card
							key={item.id}
							id={item.id}
							title={item.title}
							userName={item.creator}
							imageUri="https://via.placeholder.com/150"
							avatarUri="https://via.placeholder.com/50x50"
						/>
					);
				})}
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	loader: {
		flex: 1,
		justifyContent: "center", // 居中显示
		alignItems: "center", // 居中显示
	},
	container: {
		flex: 1,
		padding: 10,
		backgroundColor: "#f9f9f9", // 背景颜色
	},
	headerTitle: {
		fontSize: 24,
		fontWeight: "bold",
		marginVertical: 16,
	},
	cardContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between", // 让卡片分散对齐，从而产生间隙
		paddingHorizontal: 10, // 容器的左右内边距
	},
});
