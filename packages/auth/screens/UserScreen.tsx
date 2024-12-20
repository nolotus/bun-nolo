import { changeMainColor, mainColorOptions } from "app/theme/themeSlice";
import { Button, StyleSheet, View } from "react-native";
import { useDispatch } from "react-redux";
import { flexStyles } from "render/styles/flexStyles";

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

export function UserScreen({ navigation }) {
	const dispatch = useDispatch();
	const goToLogin = () => {
		navigation.navigate("Auth", { screen: "Login" });
	};
	const goToRegister = () => {
		navigation.navigate("Auth", { screen: "Register" });
	};
	const selectColor = (color) => {
		dispatch(changeMainColor(color));
	};
	return (
		<View
			style={{
				...flexStyles.flex1,
				...flexStyles.centerJustify,
				...flexStyles.centerAlign,
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
			<Button title="登录" onPress={goToLogin} />
			<Button title="注册" onPress={goToRegister} />
		</View>
	);
}
