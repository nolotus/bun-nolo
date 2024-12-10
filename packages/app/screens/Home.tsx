import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

export function HomeScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.section}>
        <Text style={styles.textDescription}>nolotus.com 的移动端测试版!</Text>
      </View>
      <View style={styles.section}>
        <TouchableOpacity onPress={() => navigation.navigate("Location")}>
          <Text style={styles.linkText}>浪点功能</Text>
          <Text style={styles.textDescription}> 待优化：数据展示</Text>
          <Text style={styles.textDescription}> 待优化：涨落潮数据</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.textDescription}>下一步增加</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Chat")}>
          <Text style={styles.linkText}>AI对话功能</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.textDescription}>
          无需登录注册也可以使用，你的数据留在手机本地。
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("User")}>
          <Text style={styles.linkText}>
            如果你需要同步你的数据，请注册或登录使用。
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={styles.textDescription}>下一步功能</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Create")}>
          <Text style={styles.linkText}>创建笔记</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
  },
  section: {
    paddingVertical: 12,
  },
  textDescription: {
    fontSize: 16,
    color: "#1F2937",
    textAlign: "center",
    marginVertical: 6,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3B82F6",
    textAlign: "center",
    marginVertical: 6,
  },
});
