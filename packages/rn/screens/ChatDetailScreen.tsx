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

// 对话详情页面
const ChatDetailScreen: React.FC = () => {
  const { goBack, currentParams } = useSimpleNavigation();
  const insets = useSafeAreaInsets();
  const { appState, setCurrentPage, setSelectedSpace } = useAppState();

  // 从参数中获取对话ID和其他信息
  const chatId = currentParams?.id || "default";
  const chatTitle = currentParams?.title || "默认对话";

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
        title={`💬 ${chatTitle}`}
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
        <InfoCard label="对话ID:" value={chatId} />
        <InfoCard label="对话标题:" value={chatTitle} />
        <InfoCard label="创建时间:" value="2025-01-05 16:30" />
        <InfoCard label="消息数量:" value="15" />
        <InfoCard label="参与者:" value="2人" />

        <View style={styles.messageArea}>
          <Text style={styles.sectionTitle}>对话内容</Text>
          <View style={styles.message}>
            <Text style={styles.messageText}>这是一条示例消息...</Text>
            <Text style={styles.messageTime}>16:30</Text>
          </View>
          <View style={[styles.message, styles.myMessage]}>
            <Text style={[styles.messageText, styles.myMessageText]}>
              这是我的回复消息...
            </Text>
            <Text style={[styles.messageTime, styles.myMessageTime]}>
              16:31
            </Text>
          </View>
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
  messageArea: {
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
  message: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  myMessage: {
    backgroundColor: "#007AFF",
    alignSelf: "flex-end",
    maxWidth: "80%",
  },
  messageText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 4,
  },
  myMessageText: {
    color: "#fff",
  },
  messageTime: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },
  myMessageTime: {
    color: "#e0e0e0",
  },
});

export default ChatDetailScreen;
