import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useSimpleNavigation } from "../SimpleNavigator";
import ResponsiveHeader from "../components/shared/ResponsiveHeader";

const AboutScreen: React.FC = () => {
  const { goBack, canGoBack } = useSimpleNavigation();

  const BackButton = () =>
    canGoBack() ? (
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Text style={styles.backButtonText}>← 返回</Text>
      </TouchableOpacity>
    ) : null;

  return (
    <View style={styles.container}>
      <ResponsiveHeader
        title="关于"
        isLargeScreen={true}
        isDesktopDrawerCollapsed={false}
        isDrawerOpen={false}
        onToggleSidebar={() => {}}
        leftActions={<BackButton />}
      />

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>应用版本:</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>构建时间:</Text>
          <Text style={styles.infoValue}>2025-01-05</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>开发者:</Text>
          <Text style={styles.infoValue}>Nolo Team</Text>
        </View>

        <Text style={styles.description}>
          这是一个响应式的React Native应用，支持桌面和移动端。
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    marginLeft: 8,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoLabel: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    textAlign: "center",
    marginTop: 20,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
  },
});

export default AboutScreen;
