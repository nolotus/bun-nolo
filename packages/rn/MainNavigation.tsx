// MainNavigation.js
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Octicons from "react-native-vector-icons/Octicons";
import { useSelector } from "react-redux";

// 导入screens
import { HomeScreen } from "app/screens/Home";
import { SpotsStackScreen } from "app/screens/SpotsStack";
import DialogListScreen from "chat/screens/DialogList";
import DialogDetail from "chat/screens/DialogDetail";
import Guide from "create/screens/Guide";
import { AuthStackNavigator } from "auth/screens/AuthStackNavigator";
import { UserScreen } from "auth/screens/UserScreen";
import { ProfileScreen } from "chat/screens/ProfileScreen"; // 新增的个人中心页面
import AccountStatisticsScreen from "chat/screens/AccountStatisticsScreen";// 新增的账户统计页面

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// 用户相关的堆栈导航
function UserStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,  // UserMain 和 Profile 不显示头部
      }}
    >
      <Stack.Screen name="UserMain" component={UserScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Statistics" component={AccountStatisticsScreen} />

    </Stack.Navigator>
  );
}


// 主标签导航
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
        component={UserStack} // 改用UserStack
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

// 主导航
function MainNavigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs" component={HomeTabs} />
        <Stack.Screen name="DialogDetail" component={DialogDetail} />
        <Stack.Screen
          name="Auth"
          component={AuthStackNavigator}
          options={{
            headerShown: false,
            presentation: 'modal' // 可选，使其以模态方式呈现
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default MainNavigation;
