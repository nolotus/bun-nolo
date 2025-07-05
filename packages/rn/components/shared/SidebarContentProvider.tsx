import React from "react";
import AppSidebarContent, { PageType } from "./AppSidebarContent";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

// 侧边栏内容类型
export type SidebarContentType = "app" | "chat" | "article" | "custom";

// 侧边栏内容配置
export interface SidebarContentConfig {
  type: SidebarContentType;
  customContent?: React.ReactNode;
  // App类型的配置
  appConfig?: {
    currentPage: PageType;
    onPageChange: (page: PageType) => void;
    selectedSpace: string;
    onSpaceChange: (space: string) => void;
  };
}

// 默认的聊天工具侧边栏内容
const ChatToolsSidebarContent: React.FC = () => (
  <View style={styles.sidebarContent}>
    <Text style={styles.sidebarTitle}>对话工具</Text>
    <TouchableOpacity style={styles.sidebarItem}>
      <Text style={styles.sidebarItemText}>📋 对话历史</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.sidebarItem}>
      <Text style={styles.sidebarItemText}>👥 参与者</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.sidebarItem}>
      <Text style={styles.sidebarItemText}>🔍 搜索消息</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.sidebarItem}>
      <Text style={styles.sidebarItemText}>⚙️ 对话设置</Text>
    </TouchableOpacity>
  </View>
);

// 默认的文章工具侧边栏内容
const ArticleToolsSidebarContent: React.FC = () => (
  <View style={styles.sidebarContent}>
    <Text style={styles.sidebarTitle}>文章工具</Text>
    <TouchableOpacity style={styles.sidebarItem}>
      <Text style={styles.sidebarItemText}>📖 目录</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.sidebarItem}>
      <Text style={styles.sidebarItemText}>🔖 书签</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.sidebarItem}>
      <Text style={styles.sidebarItemText}>💬 评论</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.sidebarItem}>
      <Text style={styles.sidebarItemText}>📊 统计</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.sidebarItem}>
      <Text style={styles.sidebarItemText}>🏷️ 标签</Text>
    </TouchableOpacity>
    <TouchableOpacity style={styles.sidebarItem}>
      <Text style={styles.sidebarItemText}>📤 分享</Text>
    </TouchableOpacity>
  </View>
);

// 侧边栏内容提供者组件
interface SidebarContentProviderProps {
  config: SidebarContentConfig;
}

const SidebarContentProvider: React.FC<SidebarContentProviderProps> = ({
  config,
}) => {
  switch (config.type) {
    case "app":
      if (!config.appConfig) {
        console.warn("App sidebar config is required for app type");
        return null;
      }
      return <AppSidebarContent {...config.appConfig} />;

    case "chat":
      return <ChatToolsSidebarContent />;

    case "article":
      return <ArticleToolsSidebarContent />;

    case "custom":
      return <>{config.customContent}</>;

    default:
      return null;
  }
};

const styles = StyleSheet.create({
  sidebarContent: {
    flex: 1,
    padding: 16,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  sidebarItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  sidebarItemText: {
    fontSize: 16,
    color: "#333",
  },
});

export default SidebarContentProvider;
