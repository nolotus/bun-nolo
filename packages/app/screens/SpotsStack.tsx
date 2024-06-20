import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SpotsScreen } from "./Spots";
import { SurfSpotScreen } from "render/surf/screens/SurfSpotScreen";
import { StatusBar } from "react-native";

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
          component={SurfSpotScreen}
          options={{
            title: "Surf Spot",
          }}
        />
      </SpotStack.Navigator>
    </>
  );
}
