import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Text } from "react-native";
import { SurfSpotScreen } from "./SurfSpotScreen";
const Tab = createMaterialTopTabNavigator();
const Feed = () => {
	return <Text>Feed</Text>;
};
const Notifications = () => {
	return <Text>Feed</Text>;
};

const Profile = () => {
	return <Text>Feed</Text>;
};
export function SurfHomeScreen({ route }) {
	const { id } = route.params;

	return (
		<Tab.Navigator
			initialRouteName="Feed"
			screenOptions={{
				tabBarActiveTintColor: "#e91e63",
				tabBarLabelStyle: { fontSize: 12 },
				tabBarStyle: { backgroundColor: "powderblue" },
			}}
		>
			<Tab.Screen
				name="SurfSpotScreen"
				children={() => <SurfSpotScreen id={id} />}
				options={{ tabBarLabel: "Home" }}
			/>
			<Tab.Screen
				name="Notifications"
				component={Notifications}
				options={{ tabBarLabel: "Updates" }}
			/>
			<Tab.Screen
				name="Profile"
				component={Profile}
				options={{ tabBarLabel: "Profile" }}
			/>
		</Tab.Navigator>
	);
}
