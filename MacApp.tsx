import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";

// 主屏幕组件
const HomeScreen = () => {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>主页</Text>
      <Text>macosx 0.78.3</Text>
    </View>
  );
};

// 设置屏幕组件
const SettingsScreen = () => {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>设置</Text>
      <Text>这里是设置页面</Text>
    </View>
  );
};

// 关于屏幕组件
const AboutScreen = () => {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>关于</Text>
      <Text>关于我们的应用</Text>
    </View>
  );
};

const Drawer = createDrawerNavigator();

const MacOSApp = () => {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Home"
        screenOptions={{
          drawerStyle: {
            backgroundColor: "#f6f6f6",
            width: 240,
          },
          headerStyle: {
            backgroundColor: "#007AFF",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Drawer.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: "主页",
            drawerLabel: "主页",
          }}
        />
        <Drawer.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: "设置",
            drawerLabel: "设置",
          }}
        />
        <Drawer.Screen
          name="About"
          component={AboutScreen}
          options={{
            title: "关于",
            drawerLabel: "关于",
          }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
});

export default MacOSApp;
