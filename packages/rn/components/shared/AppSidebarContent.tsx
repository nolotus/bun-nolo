import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import SidebarHeaderComponent from "../SidebarHeaderComponent";

// 页面类型定义
export type PageType = "chat" | "article" | "about" | "data";

// 页面配置
const PAGES = {
  chat: { title: "对话", icon: "💬" },
  article: { title: "文章", icon: "📝" },
  about: { title: "关于", icon: "ℹ️" },
  data: { title: "数据", icon: "📊" },
};

// App侧边栏内容组件的Props
interface AppSidebarContentProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  selectedSpace: string;
  onSpaceChange: (space: string) => void;
}

// App侧边栏内容组件 - 从App.tsx提取出来的可复用组件
const AppSidebarContent: React.FC<AppSidebarContentProps> = ({
  currentPage,
  onPageChange,
  selectedSpace,
  onSpaceChange,
}) => {
  return (
    <View style={styles.sidebarContent}>
      <SidebarHeaderComponent
        selectedSpace={selectedSpace}
        onSpaceChange={onSpaceChange}
        onHomeClick={() => onPageChange("chat")}
      />

      <View style={styles.navigationSection}>
        {Object.entries(PAGES).map(([pageKey, pageInfo]) => (
          <TouchableOpacity
            key={pageKey}
            style={[
              styles.sidebarItem,
              currentPage === pageKey && styles.sidebarItemActive,
            ]}
            onPress={() => onPageChange(pageKey as PageType)}
          >
            <Text
              style={[
                styles.sidebarItemText,
                currentPage === pageKey && styles.sidebarItemTextActive,
              ]}
            >
              {pageInfo.icon} {pageInfo.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebarContent: {
    flex: 1,
  },
  navigationSection: {
    flex: 1,
  },
  sidebarItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sidebarItemText: {
    fontSize: 16,
    color: "#333",
  },
  sidebarItemActive: {
    backgroundColor: "#e3f2fd",
    borderRightWidth: 3,
    borderRightColor: "#007AFF",
  },
  sidebarItemTextActive: {
    color: "#007AFF",
    fontWeight: "600",
  },
});

export default AppSidebarContent;
