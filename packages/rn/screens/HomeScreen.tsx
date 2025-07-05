import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { useSimpleNavigation } from "../SimpleNavigator";
import EnhancedSidebarLayout from "../components/EnhancedSidebarLayout";
import ResponsiveHeader from "../components/shared/ResponsiveHeader";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { SidebarContentConfig } from "../components/shared/SidebarContentProvider";

// Home页面内容组件
const HomeContent: React.FC = () => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.header}>🏠 首页</Text>
      <Text style={styles.subtitle}>这是一个示例主页</Text>
    </ScrollView>
  );
};

// Home页面组件 - 带完整布局
const HomeScreen: React.FC = () => {
  const { goBack, canGoBack } = useSimpleNavigation();
  const layoutState = useResponsiveLayout();

  const { isLargeScreen, isDesktopDrawerCollapsed, isDrawerOpen } = layoutState;

  // 侧边栏内容配置
  const sidebarContentConfig: SidebarContentConfig = {
    type: "app", // 使用应用侧边栏内容
  };

  // 头部切换侧边栏的处理函数
  const handleToggleSidebar = () => {
    if (isLargeScreen) {
      layoutState.setIsDesktopDrawerCollapsed(!isDesktopDrawerCollapsed);
    } else {
      layoutState.setIsDrawerOpen(!isDrawerOpen);
    }
  };

  return (
    <EnhancedSidebarLayout
      sidebarContentConfig={sidebarContentConfig}
      externalLayoutState={layoutState}
      onToggleSidebar={handleToggleSidebar}
    >
      <View style={styles.pageContainer}>
        <ResponsiveHeader
          title="Redux 认证演示"
          isLargeScreen={isLargeScreen}
          isDesktopDrawerCollapsed={isDesktopDrawerCollapsed}
          isDrawerOpen={isDrawerOpen}
          onToggleSidebar={handleToggleSidebar}
          leftActions={
            canGoBack() ? (
              <TouchableOpacity style={styles.backButton} onPress={goBack}>
                <Text style={styles.backButtonText}>← 返回</Text>
              </TouchableOpacity>
            ) : null
          }
        />
        <HomeContent />
      </View>
    </EnhancedSidebarLayout>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#666",
  },
  backButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  // Auth相关样式
  authContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  authTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  authButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  authButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  signInButton: {
    backgroundColor: "#007AFF",
  },
  signUpButton: {
    backgroundColor: "#34C759",
  },
  signOutButton: {
    backgroundColor: "#FF3B30",
    marginTop: 16,
  },
  authButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  userInfo: {
    backgroundColor: "#f0f8ff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  userInfoText: {
    fontSize: 14,
    marginBottom: 4,
    color: "#333",
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#f44336",
  },
  errorText: {
    color: "#d32f2f",
    fontSize: 14,
    marginBottom: 8,
  },
  clearErrorText: {
    color: "#1976d2",
    fontSize: 12,
    textDecorationLine: "underline",
  },
  infoContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  infoItem: {
    fontSize: 14,
    marginBottom: 6,
    color: "#666",
    paddingLeft: 8,
  },
});

export default HomeScreen;
