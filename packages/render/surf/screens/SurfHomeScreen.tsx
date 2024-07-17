import React, { useLayoutEffect } from "react";
import { Text, StyleSheet } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";

import { SurfSpotScreen } from "./SurfSpotScreen";

// 创建顶部标签页导航器
const Tab = createMaterialTopTabNavigator();

const Notifications = () => (
  <Text style={styles.defaultText}>Notifications</Text>
);
const Profile = () => <Text style={styles.defaultText}>My Profile</Text>;

const styles = StyleSheet.create({
  defaultText: {
    fontSize: 16, // 基准字体大小
    textAlign: "center",
  },
});

export function SurfHomeScreen({ route }) {

  const navigation = useNavigation();

  useLayoutEffect(() => {
    data?.title &&
      navigation.setOptions({
        headerTitle: `${data.title}`, // 动态设置标题
      });
  }, [navigation, data]);

  return (
    // <Tab.Navigator
    //   initialRouteName="SurfSpotScreen"
    //   tabBarOptions={{
    //     activeTintColor: mainColor, // 可以使用更鲜艳的颜色突出当前选项卡
    //     inactiveTintColor: "gray",
    //     style: {
    //       backgroundColor: "white",
    //       height: 40, // 降低标签栏的总体高度
    //     },
    //     indicatorStyle: {
    //       height: 3, // 指示器高度定制
    //       backgroundColor: mainColor,
    //     },
    //     labelStyle: {
    //       fontWeight: "bold",
    //       fontSize: 12, // 适当调整字体大小
    //       // 其他样式保持不变
    //     },
    //     iconStyle: {
    //       // 如果有这个属性，根据需要调整
    //       size: 20, // 适当调整图标大小
    //     },
    //     tabStyle: {
    //       flexDirection: "row",
    //       paddingVertical: 2, // 减少垂直内边距
    //     },
    //   }}
    // >
    //   <Tab.Screen
    //     name="SurfSpotScreen"
    //     children={() => <SurfSpotScreen id={id} />}
    //     options={{ tabBarLabel: "Home" }}
    //   />
    //   <Tab.Screen
    //     name="Notifications"
    //     component={Notifications}
    //     options={{ tabBarLabel: "Updates" }}
    //   />
    //   <Tab.Screen
    //     name="Profile"
    //     component={Profile}
    //     options={{ tabBarLabel: "Profile" }}
    //   />
    // </Tab.Navigator>
  );
}
