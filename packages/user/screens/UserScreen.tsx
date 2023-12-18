import { StyleSheet, View, Text, Button } from "react-native";
import { mainColorOptions, changeMainColor } from "app/theme/themeSlice";
import { useDispatch, useSelector } from "react-redux";
import { flexStyles } from "app/styles/flexStyles";
const styles = StyleSheet.create({
	bluesContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		margin: 5,
	},
	blueBox: {
		justifyContent: "center",
		alignItems: "center",
		margin: 5,
	},
	blueBoxText: {
		color: "white",
		fontWeight: "bold",
	},
});

export function UserScreen() {
	const dispatch = useDispatch();
	const mainBackgroundColor = useSelector(
		(state) => state.theme.mainBackgroundColor,
	); // 从 Redux store 获取背景颜色

	const selectColor = (color) => {
		dispatch(changeMainColor(color));
	};
	return (
		<View
			style={{
				...flexStyles.flex1,
				...flexStyles.centerJustify,
				...flexStyles.centerAlign,
				backgroundColor: mainBackgroundColor,
			}}
		>
			<View style={styles.bluesContainer}>
				{mainColorOptions.map((blue, index) => (
					<View key={index} style={[styles.blueBox, { backgroundColor: blue }]}>
						<Button
							title="选择颜色"
							onPress={() => selectColor(blue)}
							color={blue}
						/>
					</View>
				))}
			</View>
		</View>
	);
}
