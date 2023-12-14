import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SpotsScreen } from "./Spots";
import { SurfHomeScreen } from "render/surf/screens/SurfHomeScreen";

const SpotStack = createNativeStackNavigator();

export function SpotsStackScreen() {
	return (
		<SpotStack.Navigator>
			<SpotStack.Screen name="Spots" component={SpotsScreen} />
			<SpotStack.Screen name="SurfSpot" component={SurfHomeScreen} />
		</SpotStack.Navigator>
	);
}
