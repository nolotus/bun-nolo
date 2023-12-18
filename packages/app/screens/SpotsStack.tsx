import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SpotsScreen } from "./Spots";
import { SurfHomeScreen } from "render/surf/screens/SurfHomeScreen";
import { View, Text, StatusBar, TouchableOpacity } from "react-native";

const SpotStack = createNativeStackNavigator();

export function SpotsStackScreen() {
	return (
		<>
			<StatusBar backgroundColor={"#fff"} />
			<SpotStack.Navigator>
				<SpotStack.Screen
					name="Spots"
					component={SpotsScreen}
					options={{ title: "Spots" }}
				/>
				<SpotStack.Screen
					name="SurfSpot"
					component={SurfHomeScreen}
					options={{
						title: "Surf Spot",
						// 可以添加特别的样式覆盖共享样式
					}}
				/>
			</SpotStack.Navigator>
		</>
	);
}
