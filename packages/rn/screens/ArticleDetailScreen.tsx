import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSimpleNavigation } from "../SimpleNavigator";
import EnhancedSidebarLayout from "../components/EnhancedSidebarLayout";
import ResponsiveHeader from "../components/shared/ResponsiveHeader";
import UserMenu from "../components/shared/UserMenu";
import { useResponsiveLayout } from "../hooks/useResponsiveLayout";
import { SidebarContentConfig } from "../components/shared/SidebarContentProvider";
import { useAppState, PageType } from "../context/AppStateContext";

// 信息卡片组件
const InfoCard = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.infoCard}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

// 文章详情页面
const ArticleDetailScreen: React.FC = () => {
  const { goBack, currentParams } = useSimpleNavigation();
  const insets = useSafeAreaInsets();
  const { appState, setCurrentPage, setSelectedSpace } = useAppState();

  // 从参数中获取文章ID和其他信息
  const articleId = currentParams?.id || "default";
  const articleTitle = currentParams?.title || "默认文章";

  // 使用响应式布局Hook
  const layoutState = useResponsiveLayout();

  const handlePageChange = (page: PageType) => {
    console.log("Page changed to:", page);
    // 更新全局页面状态
    setCurrentPage(page);
    // 导航回主页面
    goBack();
  };

  const handleSpaceChange = (space: string) => {
    console.log("Space changed to:", space);
    setSelectedSpace(space);
  };

  // 配置App sidebar内容
  const sidebarContentConfig: SidebarContentConfig = {
    type: "app",
    appConfig: {
      currentPage: appState.currentPage,
      onPageChange: handlePageChange,
      selectedSpace: appState.selectedSpace,
      onSpaceChange: handleSpaceChange,
    },
  };

  // 返回按钮组件
  const BackButton = () => (
    <TouchableOpacity style={styles.backButton} onPress={goBack}>
      <Text style={styles.backButtonText}>← 返回</Text>
    </TouchableOpacity>
  );

  // 模拟用户信息（在实际应用中应该从全局状态或props获取）
  const userInfo = {
    name: "用户001",
    email: "user001@example.com",
  };

  // 用户菜单组件
  const UserMenuComponent = () => <UserMenu userInfo={userInfo} />;

  // 主内容区域
  const mainContent = (
    <View style={styles.container}>
      <ResponsiveHeader
        title={`📝 ${articleTitle}`}
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
        leftActions={<BackButton />}
        rightActions={<UserMenuComponent />}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom }}
      >
        <InfoCard label="文章ID:" value={articleId} />
        <InfoCard label="文章标题:" value={articleTitle} />
        <InfoCard label="作者:" value="Nolo Team" />
        <InfoCard label="发布时间:" value="2025-01-05" />
        <InfoCard label="阅读量:" value="1,234" />
        <InfoCard label="点赞数:" value="56" />

        <View style={styles.articleContent}>
          <Text style={styles.sectionTitle}>文章内容</Text>
          <Text style={styles.articleText}>
            这是一篇示例文章的内容。文章内容会在这里显示，包含丰富的文本信息和格式。
            {"\n\n"}
            文章可能包含多个段落，每个段落都有自己的主题和内容。这里展示的是一个简化的版本，
            实际应用中可能会有更复杂的富文本编辑器和渲染功能。
            {"\n\n"}
            文章的内容可以很长，用户可以通过滚动来查看完整的内容。
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>👍 点赞</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>💬 评论</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📤 分享</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  backButton: {
    padding: 8,
    paddingHorizontal: 12,
    marginLeft: 4,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    minHeight: 36,
    justifyContent: "center",
  },
  backButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "500",
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
  articleContent: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  articleText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  actionButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});

export default ArticleDetailScreen;
