import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import React, { useLayoutEffect } from "react";
import { useGetEntryQuery } from "database/services";

import { SurfSpotScreen } from "./SurfSpotScreen";
const Tab = createMaterialTopTabNavigator();

const Notifications = () => {
	return <Text>Feed</Text>;
};

const Profile = () => {
	return <Text>Feed</Text>;
};
export function SurfHomeScreen({ route }) {
	const { id } = route.params;
	const navigation = useNavigation();
	const { data, isLoading } = useGetEntryQuery({
		entryId: id,
		domain: "nolotus.com",
	});

	useLayoutEffect(() => {
		data?.title &&
			navigation.setOptions({
				headerTitle: `${data.title}`, // 动态设置标题
			});
	}, [navigation, data]);
	return (
		<Tab.Navigator
			initialRouteName="SurfSpotScreen"
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
