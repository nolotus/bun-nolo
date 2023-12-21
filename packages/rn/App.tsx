import React from "react";
import { StatusBar, useColorScheme } from "react-native";

import { Colors } from "react-native/Libraries/NewAppScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import i18n from "i18n";
import * as RNLocalize from "react-native-localize";
import "intl-pluralrules";

import { Provider } from "react-redux";
import { mobileStore } from "./store";
import MainNavigation from "./MainNavigation";
const Tab = createBottomTabNavigator();
// 请根据具体需求调整颜色值

function App(): React.JSX.Element {
	const isDarkMode = useColorScheme() === "dark";
	const systemLanguage = RNLocalize.getLocales()[0].languageCode;
	i18n.changeLanguage(systemLanguage);
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
