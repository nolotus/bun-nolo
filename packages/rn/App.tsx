import React from "react";
import {
	StatusBar,
	StyleSheet,
	Text,
	useColorScheme,
	View,
} from "react-native";

import { Colors } from "react-native/Libraries/NewAppScreen";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Octicons from "react-native-vector-icons/Octicons";

import { SpotsScreen } from "app/screens/Spots";

import { Provider } from "react-redux";
import { mobileStore } from "./store";

const Tab = createBottomTabNavigator();

function HomeScreen() {
	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<Text>Home!</Text>
		</View>
	);
}

function ChatScreen() {
	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<Text>chat!</Text>
		</View>
	);
}

function UserScreen() {
	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<Text>User!</Text>
		</View>
	);
}

function CreateScreen() {
	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<Text>Create!</Text>
		</View>
	);
}
function App(): React.JSX.Element {
	const isDarkMode = useColorScheme() === "dark";

	const backgroundStyle = {
		backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
	};

	return (
		<Provider store={mobileStore}>
			<StatusBar
				barStyle={isDarkMode ? "light-content" : "dark-content"}
				backgroundColor={backgroundStyle.backgroundColor}
			/>
			<NavigationContainer>
				<Tab.Navigator
					screenOptions={({ route }) => ({
						tabBarIcon: ({ focused, color, size }) => {
							let iconName;

							switch (route.name) {
								case "Home":
									iconName = "home";
									break;
							}
							// You can return any component that you like here!
							return <Octicons name={iconName} size={size} color={color} />;
						},
						tabBarActiveTintColor: "tomato",
						tabBarInactiveTintColor: "gray",
					})}
				>
					<Tab.Screen name="Home" component={HomeScreen} />
					<Tab.Screen
						name="Chat"
						component={ChatScreen}
						options={{
							tabBarLabel: "Chat",
							tabBarIcon: ({ color, size }) => (
								<Octicons name="comment" size={size} color={color} />
							),
						}}
					/>
					<Tab.Screen
						name="Create"
						component={CreateScreen}
						options={{
							tabBarLabel: "Create",
							tabBarIcon: ({ color, size }) => (
								<Octicons name="plus" size={size} color={color} />
							),
						}}
					/>
					<Tab.Screen
						name="Location"
						component={SpotsScreen}
						options={{
							tabBarLabel: "Spots",
							tabBarIcon: ({ color, size }) => (
								<Octicons name="location" size={size} color={color} />
							),
						}}
					/>
					<Tab.Screen
						name="User"
						component={UserScreen}
						options={{
							tabBarLabel: "User",
							tabBarIcon: ({ color, size }) => (
								<Octicons name="person" size={size} color={color} />
							),
						}}
					/>
				</Tab.Navigator>
			</NavigationContainer>
		</Provider>
	);
}

const styles = StyleSheet.create({});

export default App;
