import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import SidebarHeaderComponent from "../SidebarHeaderComponent";
import { useSimpleNavigation } from "../../SimpleNavigator";

// 页面类型定义
export type PageType = "home" | "chat" | "article";

// 页面配置
const PAGES = {
  home: { title: "首页", icon: "🏠" },
  chat: { title: "对话", icon: "💬" },
  article: { title: "文章", icon: "📝" },
};

// 模拟对话数据
const CHAT_ITEMS = [
  {
    id: "chat_001",
    title: "项目讨论",
    subtitle: "关于新功能的讨论...",
    time: "2小时前",
  },
  {
    id: "chat_002",
    title: "技术交流",
    subtitle: "React Native开发经验分享",
    time: "5小时前",
  },
  {
    id: "chat_003",
    title: "产品规划",
    subtitle: "下个版本的功能规划",
    time: "1天前",
  },
  {
    id: "chat_004",
    title: "Bug修复",
    subtitle: "修复登录页面的问题",
    time: "2天前",
  },
  {
    id: "chat_005",
    title: "代码审查",
    subtitle: "审查新提交的代码",
    time: "3天前",
  },
];

// 模拟文章数据
const ARTICLE_ITEMS = [
  {
    id: "article_001",
    title: "React Native最佳实践",
    subtitle: "分享开发中的经验和技巧",
    time: "1天前",
  },
  {
    id: "article_002",
    title: "移动端UI设计指南",
    subtitle: "如何设计优秀的移动应用界面",
    time: "3天前",
  },
  {
    id: "article_003",
    title: "性能优化技巧",
    subtitle: "提升应用性能的方法",
    time: "1周前",
  },
  {
    id: "article_004",
    title: "状态管理最佳实践",
    subtitle: "Redux vs Context API",
    time: "2周前",
  },
  {
    id: "article_005",
    title: "跨平台开发指南",
    subtitle: "一套代码多端运行",
    time: "3周前",
  },
];

// App侧边栏内容组件的Props
interface AppSidebarContentProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  selectedSpace: string;
  onSpaceChange: (space: string) => void;
}

// 渲染对话和文章的组合列表
const renderCombinedList = (
  navigate: (screen: any, params?: any, sidebarConfig?: any) => void
) => (
  <ScrollView style={styles.itemListContainer}>
    {/* 对话部分 */}
    <Text style={styles.sectionTitle}>最近对话</Text>
    {CHAT_ITEMS.map((item) => (
      <TouchableOpacity
        key={item.id}
        style={styles.listItem}
        onPress={() =>
          navigate(
            "ChatDetail",
            { id: item.id, title: item.title },
            { enabled: true, type: "chat" }
          )
        }
      >
        <View style={styles.listItemContent}>
          <Text style={styles.listItemTitle} numberOfLines={1}>
            💬 {item.title}
          </Text>
          <Text style={styles.listItemSubtitle} numberOfLines={2}>
            {item.subtitle}
          </Text>
          <Text style={styles.listItemTime}>{item.time}</Text>
        </View>
      </TouchableOpacity>
    ))}

    {/* 文章部分 */}
    <Text style={[styles.sectionTitle, { marginTop: 20 }]}>最新文章</Text>
    {ARTICLE_ITEMS.map((item) => (
      <TouchableOpacity
        key={item.id}
        style={styles.listItem}
        onPress={() =>
          navigate(
            "ArticleDetail",
            { id: item.id, title: item.title },
            { enabled: true, type: "article" }
          )
        }
      >
        <View style={styles.listItemContent}>
          <Text style={styles.listItemTitle} numberOfLines={1}>
            📝 {item.title}
          </Text>
          <Text style={styles.listItemSubtitle} numberOfLines={2}>
            {item.subtitle}
          </Text>
          <Text style={styles.listItemTime}>{item.time}</Text>
        </View>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

// 渲染对话列表
const renderChatList = (
  navigate: (screen: any, params?: any, sidebarConfig?: any) => void
) => (
  <ScrollView style={styles.itemListContainer}>
    <Text style={styles.sectionTitle}>最近对话</Text>
    {CHAT_ITEMS.map((item) => (
      <TouchableOpacity
        key={item.id}
        style={styles.listItem}
        onPress={() =>
          navigate(
            "ChatDetail",
            { id: item.id, title: item.title },
            { enabled: true, type: "chat" }
          )
        }
      >
        <View style={styles.listItemContent}>
          <Text style={styles.listItemTitle} numberOfLines={1}>
            💬 {item.title}
          </Text>
          <Text style={styles.listItemSubtitle} numberOfLines={2}>
            {item.subtitle}
          </Text>
          <Text style={styles.listItemTime}>{item.time}</Text>
        </View>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

// 渲染文章列表
const renderArticleList = (
  navigate: (screen: any, params?: any, sidebarConfig?: any) => void
) => (
  <ScrollView style={styles.itemListContainer}>
    <Text style={styles.sectionTitle}>最新文章</Text>
    {ARTICLE_ITEMS.map((item) => (
      <TouchableOpacity
        key={item.id}
        style={styles.listItem}
        onPress={() =>
          navigate(
            "ArticleDetail",
            { id: item.id, title: item.title },
            { enabled: true, type: "article" }
          )
        }
      >
        <View style={styles.listItemContent}>
          <Text style={styles.listItemTitle} numberOfLines={1}>
            📝 {item.title}
          </Text>
          <Text style={styles.listItemSubtitle} numberOfLines={2}>
            {item.subtitle}
          </Text>
          <Text style={styles.listItemTime}>{item.time}</Text>
        </View>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

// App侧边栏内容组件 - 从App.tsx提取出来的可复用组件
const AppSidebarContent: React.FC<AppSidebarContentProps> = ({
  currentPage,
  onPageChange,
  selectedSpace,
  onSpaceChange,
}) => {
  const { navigate } = useSimpleNavigation();

  return (
    <View style={styles.sidebarContent}>
      <SidebarHeaderComponent
        selectedSpace={selectedSpace}
        onSpaceChange={onSpaceChange}
        onHomeClick={() => onPageChange("chat")}
      />

      <View style={styles.contentSection}>{renderCombinedList(navigate)}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebarContent: {
    flex: 1,
  },
  navigationSection: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  navigationItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 8,
  },
  navigationItemText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  navigationItemActive: {
    backgroundColor: "#e3f2fd",
  },
  navigationItemTextActive: {
    color: "#007AFF",
    fontWeight: "600",
  },
  contentSection: {
    flex: 1,
  },
  itemListContainer: {
    flex: 1,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  listItem: {
    backgroundColor: "#fff",
    marginHorizontal: 8,
    marginVertical: 4,
    borderRadius: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  listItemContent: {
    padding: 12,
  },
  listItemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  listItemSubtitle: {
    fontSize: 12,
    color: "#666",
    lineHeight: 16,
    marginBottom: 6,
  },
  listItemTime: {
    fontSize: 11,
    color: "#999",
  },
  infoContainer: {
    padding: 20,
    alignItems: "center",
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  infoDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  // 保留原有的样式以防其他地方使用
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
