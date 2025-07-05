import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 响应式Header组件 - 统一处理sidebar按钮逻辑
interface ResponsiveHeaderProps {
  title: string;
  isLargeScreen: boolean;
  isDesktopDrawerCollapsed: boolean;
  isDrawerOpen?: boolean;
  onToggleSidebar: () => void;
  leftActions?: React.ReactNode; // 额外的左侧操作按钮（如返回按钮）
  rightActions?: React.ReactNode; // 右侧操作按钮
}

const ResponsiveHeader: React.FC<ResponsiveHeaderProps> = ({
  title,
  isLargeScreen,
  isDesktopDrawerCollapsed,
  isDrawerOpen,
  onToggleSidebar,
  leftActions,
  rightActions,
}) => {
  const insets = useSafeAreaInsets();

  // 获取菜单图标 - 与App.tsx保持一致
  const getMenuIcon = () => {
    if (isLargeScreen) {
      return isDesktopDrawerCollapsed ? "☰" : "✕";
    } else {
      return isDrawerOpen ? "✕" : "☰";
    }
  };

  return (
    <View
      style={[
        styles.header,
        { paddingTop: insets.top, height: 60 + insets.top },
      ]}
    >
      <View style={styles.headerLeft}>
        <TouchableOpacity
          style={styles.sidebarButton}
          onPress={onToggleSidebar}
          activeOpacity={0.7}
        >
          <Text style={styles.sidebarButtonText}>{getMenuIcon()}</Text>
        </TouchableOpacity>
        {leftActions}
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.headerRight}>{rightActions}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#1a1a1a", // 更现代的深色背景
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    zIndex: 9998,
    position: "relative",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-start",
  },
  titleContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    pointerEvents: "none", // 关键修复：让标题容器不拦截点击事件
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
    zIndex: 9999,
  },
  sidebarButton: {
    padding: 10,
    marginRight: 12,
    minWidth: 40,
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
  },
  sidebarButtonText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "500",
  },
  title: {
    fontSize: 19,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    letterSpacing: 0.3,
  },
});

export default ResponsiveHeader;
