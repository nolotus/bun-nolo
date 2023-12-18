import React from "react";
import { StatusBar, StyleSheet, useColorScheme } from "react-native";

import { Colors } from "react-native/Libraries/NewAppScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { Provider } from "react-redux";
import { mobileStore } from "./store";
import MainNavigation from "./MainNavigation";
const Tab = createBottomTabNavigator();
// 请根据具体需求调整颜色值

function App(): React.JSX.Element {
	const isDarkMode = useColorScheme() === "dark";

	const backgroundStyle = {
		backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
	};

	return (
		<Provider store={mobileStore}>
			<StatusBar
				barStyle={isDarkMode ? "light-content" : "dark-content"}
				backgroundColor={"#fff"}
			/>
			<MainNavigation />
		</Provider>
	);
}

export default App;
