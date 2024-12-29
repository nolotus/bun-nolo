// MainNavigation.js
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Octicons from "react-native-vector-icons/Octicons";
import { SpotsStackScreen } from "app/screens/SpotsStack";
import { View, Text } from "react-native";
import { useSelector } from "react-redux";
import { UserScreen } from "auth/screens/UserScreen";
import { HomeScreen } from "app/screens/Home";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DialogListScreen from "chat/screens/DialogList";
import DialogDetail from "chat/screens/DialogDetail";
import Guide from "create/screens/Guide";

const Stack = createNativeStackNavigator();

// function ChatStackNavigator({ navigation, route }) {
//   return (
//     <Stack.Navigator>
//       <Stack.Screen
//         name="DialogList"
//         component={DialogListScreen}
//        
//       />
//
//     </Stack.Navigator>
//   );
// }

import { AuthStackNavigator } from "auth/screens/AuthStackNavigator";
function CreateScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Create!</Text>
    </View>
  );
}
const Tab = createBottomTabNavigator();
function HomeTabs() {
  const mainColor = useSelector((state) => state.theme.mainColor);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarInactiveTintColor: "gray",
        tabBarActiveTintColor: mainColor,
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
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen
        name="Chat"
        component={DialogListScreen}
        options={{
          title: "对话列表",
          tabBarLabel: "聊天",
          tabBarIcon: ({ color, size }) => (
            <Octicons name="comment" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Create"
        component={Guide}
        options={{
          tabBarLabel: "创建",
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
  );
}
function MainNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeTabs} />
        <Stack.Screen name="DialogDetail" component={DialogDetail} />
        <Tab.Screen
          name="Auth"
          component={AuthStackNavigator}
          options={{ tabBarButton: () => null }} // 使其不在底部标签中显示
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default MainNavigation;

