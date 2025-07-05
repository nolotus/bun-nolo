import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSimpleNavigation } from "../SimpleNavigator";

// 信息卡片组件
const InfoCard = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoCard}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

// 用户资料页面
const UserProfileScreen: React.FC = () => {
  const { goBack } = useSimpleNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Text style={styles.backButtonText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>👤 用户资料</Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom }}
      >
        <InfoCard label="用户名:" value="用户001" />
        <InfoCard label="邮箱:" value="user001@example.com" />
        <InfoCard label="注册时间:" value="2024-12-01" />
        <InfoCard label="权限级别:" value="管理员" />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    height: 60,
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    marginRight: 15,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
  },
});

export default UserProfileScreen;
