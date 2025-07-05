import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import UserMenu from "rn/components/shared/UserMenu";
import SimpleNavigator, { useSimpleNavigation } from "rn/SimpleNavigator";
import EnhancedSidebarLayout from "rn/components/EnhancedSidebarLayout";
import ResponsiveHeader from "rn/components/shared/ResponsiveHeader";
import { useResponsiveLayout } from "rn/hooks/useResponsiveLayout";
import { SidebarContentConfig } from "rn/components/shared/SidebarContentProvider";
import { AppStateProvider, useAppState } from "rn/context/AppStateContext";

// 页面类型定义
export type PageType = "chat" | "article";

// 页面配置
const PAGES = {
  chat: { title: "对话", icon: "💬" },
  article: { title: "文章", icon: "📝" },
};

// 信息卡片组件 - 可复用的UI组件
interface InfoCardProps {
  label: string;
  value: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ label, value }) => (
  <View style={styles.infoCard}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

// 页面内容渲染组件 - 根据页面类型渲染不同内容
const renderPageContent = (
  currentPage: PageType,
  screenWidth: number,
  isLargeScreen: boolean,
  navigate: (screen: any, params?: any, sidebarConfig?: any) => void,
  isDesktopDrawerCollapsed?: boolean,
  isDrawerOpen?: boolean
) => {
  const pageInfo = PAGES[currentPage];

  switch (currentPage) {
    case "chat":
      return (
        <View>
          <InfoCard label="当前会话:" value="默认会话" />
          <Text style={styles.description}>在这里开始您的对话。</Text>

          <View style={styles.itemList}>
            <Text style={styles.listTitle}>最近对话</Text>
            <TouchableOpacity
              style={styles.listItem}
              onPress={() =>
                navigate(
                  "ChatDetail",
                  { id: "chat_001", title: "项目讨论" },
                  { enabled: true, type: "chat" }
                )
              }
            >
              <Text style={styles.listItemTitle}>💬 项目讨论</Text>
              <Text style={styles.listItemSubtitle}>关于新功能的讨论...</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.listItem}
              onPress={() =>
                navigate(
                  "ChatDetail",
                  { id: "chat_002", title: "技术交流" },
                  { enabled: false }
                )
              }
            >
              <Text style={styles.listItemTitle}>💬 技术交流</Text>
              <Text style={styles.listItemSubtitle}>
                React Native开发经验分享
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    case "article":
      return (
        <View>
          <InfoCard label="总文章数:" value="42" />
          <Text style={styles.description}>在这里浏览和管理您的文章。</Text>

          <View style={styles.itemList}>
            <Text style={styles.listTitle}>热门文章</Text>
            <TouchableOpacity
              style={styles.listItem}
              onPress={() =>
                navigate(
                  "ArticleDetail",
                  { id: "article_001", title: "React Native最佳实践" },
                  { enabled: true, type: "article" }
                )
              }
            >
              <Text style={styles.listItemTitle}>📝 React Native最佳实践</Text>
              <Text style={styles.listItemSubtitle}>
                分享开发中的经验和技巧
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.listItem}
              onPress={() =>
                navigate(
                  "ArticleDetail",
                  { id: "article_002", title: "移动端UI设计指南" },
                  { enabled: false }
                )
              }
            >
              <Text style={styles.listItemTitle}>📝 移动端UI设计指南</Text>
              <Text style={styles.listItemSubtitle}>
                如何设计优秀的移动应用界面
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    default:
      return (
        <View>
          <Text style={styles.description}>页面内容加载中...</Text>
        </View>
      );
  }
};

// 页面内容组件 - 业务逻辑组件
interface PageContentProps {
  screenWidth: number;
  isLargeScreen: boolean;
  isDesktopDrawerCollapsed?: boolean;
  isDrawerOpen?: boolean;
  onToggleDrawer: () => void;
  currentPage: PageType;
}

const PageContent: React.FC<PageContentProps> = ({
  screenWidth,
  isLargeScreen,
  isDesktopDrawerCollapsed,
  isDrawerOpen,
  onToggleDrawer,
  currentPage,
}) => {
  const pageInfo = PAGES[currentPage];
  const { navigate } = useSimpleNavigation();

  return (
    <View style={styles.pageContent}>
      <Text style={styles.pageTitle}>
        {pageInfo.icon} {pageInfo.title}
      </Text>

      {renderPageContent(
        currentPage,
        screenWidth,
        isLargeScreen,
        navigate,
        isDesktopDrawerCollapsed,
        isDrawerOpen
      )}

      <TouchableOpacity style={styles.actionButton} onPress={onToggleDrawer}>
        <Text style={styles.actionButtonText}>
          {isLargeScreen
            ? isDesktopDrawerCollapsed
              ? "展开侧边栏"
              : "折叠侧边栏"
            : isDrawerOpen
              ? "收起侧边栏"
              : "展开侧边栏"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// 内部应用组件 - 不包含NavigationContainer
const InnerApp = () => {
  const layoutState = useResponsiveLayout();
  const { appState, setCurrentPage, setSelectedSpace } = useAppState();

  // 配置App sidebar内容
  const sidebarContentConfig: SidebarContentConfig = {
    type: "app",
    appConfig: {
      currentPage: appState.currentPage,
      onPageChange: setCurrentPage,
      selectedSpace: appState.selectedSpace,
      onSpaceChange: setSelectedSpace,
    },
  };

  // 模拟用户信息
  const userInfo = {
    name: "用户001",
    email: "user001@example.com",
  };

  // 用户菜单组件
  const UserMenuWrapper = () => <UserMenu userInfo={userInfo} />;

  // 主内容区域
  const mainContent = (
    <View style={styles.container}>
      <ResponsiveHeader
        title="React Native App"
        isLargeScreen={layoutState.isLargeScreen}
        isDesktopDrawerCollapsed={layoutState.isDesktopDrawerCollapsed}
        isDrawerOpen={layoutState.isDrawerOpen}
        onToggleSidebar={() => {
          if (layoutState.isLargeScreen) {
            layoutState.setIsDesktopDrawerCollapsed(
              !layoutState.isDesktopDrawerCollapsed
            );
          } else {
            layoutState.setIsDrawerOpen(!layoutState.isDrawerOpen);
          }
        }}
        rightActions={<UserMenuWrapper />}
      />

      <PageContent
        screenWidth={layoutState.screenWidth}
        isLargeScreen={layoutState.isLargeScreen}
        isDesktopDrawerCollapsed={layoutState.isDesktopDrawerCollapsed}
        isDrawerOpen={layoutState.isDrawerOpen}
        onToggleDrawer={() => {
          if (layoutState.isLargeScreen) {
            layoutState.setIsDesktopDrawerCollapsed(
              !layoutState.isDesktopDrawerCollapsed
            );
          } else {
            layoutState.setIsDrawerOpen(!layoutState.isDrawerOpen);
          }
        }}
        currentPage={appState.currentPage}
      />
    </View>
  );

  return (
    <EnhancedSidebarLayout
      sidebarContentConfig={sidebarContentConfig}
      externalLayoutState={layoutState}
    >
      {mainContent}
    </EnhancedSidebarLayout>
  );
};

// 主应用组件 - 包含SimpleNavigator和AppStateProvider
const MacOSApp = () => {
  return (
    <AppStateProvider>
      <SimpleNavigator>
        <InnerApp />
      </SimpleNavigator>
    </AppStateProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  pageContent: {
    flex: 1,
    padding: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 30,
    textAlign: "center",
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
  actionButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    textAlign: "center",
    marginTop: 20,
  },
  // 列表样式
  itemList: {
    marginTop: 20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  listItem: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: "#666",
  },
});

export default MacOSApp;
