import { Button, StyleSheet, View } from "react-native";

export const flexStyles = StyleSheet.create({
	flex1: {
		flex: 1,
	},
	centerJustify: {
		justifyContent: "center",
	},
	centerAlign: {
		alignItems: "center",
	},
});

export function UserScreen({ navigation }) {
	const goToLogin = () => {
		navigation.navigate("Auth", { screen: "Login" });
	};
	const goToRegister = () => {
		navigation.navigate("Auth", { screen: "Register" });
	};

	return (
		<View
			style={{
				...flexStyles.flex1,
				...flexStyles.centerJustify,
				...flexStyles.centerAlign,
			}}
		>

			<Button title="登录" onPress={goToLogin} />
			<Button title="注册" onPress={goToRegister} />
		</View>
	);
}
