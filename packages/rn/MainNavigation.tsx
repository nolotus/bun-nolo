// MainNavigation.js
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Octicons from "react-native-vector-icons/Octicons";
import { SpotsStackScreen } from "app/screens/SpotsStack";
import { View, Text } from "react-native";
import { useSelector } from "react-redux";
import { UserScreen } from "user/screens/UserScreen";
import { HomeScreen } from "app/screens/Home";
function ChatScreen() {
	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<Text>chat!</Text>
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
const Tab = createBottomTabNavigator();

function MainNavigation() {
	const mainColor = useSelector((state) => state.theme.mainColor);

	return (
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
					tabBarActiveTintColor: mainColor,
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
					component={SpotsStackScreen}
					options={{
						headerShown: false,
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
	);
}

export default MainNavigation;
