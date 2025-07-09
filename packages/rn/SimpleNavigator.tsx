// SimpleNavigator.tsx
import React, { useState, createContext, useContext, ReactNode } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// 动态导入所有 screens
const screens = {
  UserProfile: () => require("./screens/UserProfileScreen").default,
  Settings: () => require("./screens/SettingsScreen").default,
  Recharge: () => require("./screens/RechargeScreen").default,
  ChatDetail: () => require("./screens/ChatDetailScreen").default,
  ArticleDetail: () => require("./screens/ArticleDetailScreen").default,
  About: () => require("./screens/AboutScreen").default,
  Data: () => require("./screens/DataScreen").default,
  HomeScreen: () => require("./screens/HomeScreen").default,
};

// 导航类型定义
export type ScreenName = keyof typeof screens | "Main";

// 导航参数类型
export interface NavigationParams {
  [key: string]: any;
}

// 侧边栏配置类型
export interface SidebarConfig {
  enabled: boolean;
  type?: "default" | "chat" | "article" | "custom";
  customContent?: ReactNode;
}

// 页面类型定义
export type PageType = "home" | "chat" | "article";

// 页面配置（可用于菜单或标签）
export const PAGES: Record<PageType, { title: string; icon: string }> = {
  home: { title: "首页", icon: "🏠" },
  chat: { title: "对话", icon: "💬" },
  article: { title: "文章", icon: "📝" },
};

// 信息卡片组件
interface InfoCardProps {
  label: string;
  value: string;
}
export const InfoCard: React.FC<InfoCardProps> = ({ label, value }) => (
  <View style={[styles.baseCard, styles.infoExtras]}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

// 每页内容组件 Props
interface PageProps {
  navigate: (
    screen: ScreenName,
    params?: NavigationParams,
    sidebarConfig?: SidebarConfig
  ) => void;
}

// Home 页
const HomePageContent: React.FC<PageProps> = ({ navigate }) => (
  <View>
    <InfoCard label="Redux状态:" value="已集成" />
    <Text style={styles.description}>这里展示Redux Toolkit的使用示例。</Text>
    <TouchableOpacity
      style={styles.baseCard}
      onPress={() =>
        navigate("HomeScreen", { title: "Redux认证演示" }, { enabled: false })
      }
    >
      <Text style={styles.listItemTitle}>🏠 Redux认证演示</Text>
      <Text style={styles.listItemSubtitle}>
        使用Redux Toolkit进行用户认证管理
      </Text>
    </TouchableOpacity>
  </View>
);

// Chat 页
const ChatPageContent: React.FC<PageProps> = ({ navigate }) => (
  <View>
    <InfoCard label="当前会话:" value="默认会话" />
    <Text style={styles.description}>在这里开始您的对话。</Text>
    <View style={styles.itemList}>
      <Text style={styles.listTitle}>最近对话</Text>
      <TouchableOpacity
        style={styles.baseCard}
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
        style={styles.baseCard}
        onPress={() =>
          navigate("ChatDetail", { id: "chat_002", title: "技术交流" })
        }
      >
        <Text style={styles.listItemTitle}>💬 技术交流</Text>
        <Text style={styles.listItemSubtitle}>React Native开发经验分享</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// Article 页
const ArticlePageContent: React.FC<PageProps> = ({ navigate }) => (
  <View>
    <InfoCard label="总文章数:" value="42" />
    <Text style={styles.description}>在这里浏览和管理您的文章。</Text>
    <View style={styles.itemList}>
      <Text style={styles.listTitle}>热门文章</Text>
      <TouchableOpacity
        style={styles.baseCard}
        onPress={() =>
          navigate(
            "ArticleDetail",
            { id: "article_001", title: "React Native最佳实践" },
            { enabled: true, type: "article" }
          )
        }
      >
        <Text style={styles.listItemTitle}>📝 React Native最佳实践</Text>
        <Text style={styles.listItemSubtitle}>分享开发中的经验和技巧</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.baseCard}
        onPress={() =>
          navigate("ArticleDetail", {
            id: "article_002",
            title: "移动端UI设计指南",
          })
        }
      >
        <Text style={styles.listItemTitle}>📝 移动端UI设计指南</Text>
        <Text style={styles.listItemSubtitle}>如何设计优秀的移动应用界面</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// Loading 页
const LoadingPageContent: React.FC = () => (
  <View>
    <Text style={styles.description}>页面内容加载中...</Text>
  </View>
);

// 页面内容渲染函数
export const renderPageContent = (
  currentPage: PageType,
  screenWidth: number,
  isLargeScreen: boolean,
  navigate: (
    screen: ScreenName,
    params?: NavigationParams,
    sidebarConfig?: SidebarConfig
  ) => void,
  isDesktopDrawerCollapsed?: boolean,
  isDrawerOpen?: boolean
): ReactNode => {
  switch (currentPage) {
    case "home":
      return <HomePageContent navigate={navigate} />;
    case "chat":
      return <ChatPageContent navigate={navigate} />;
    case "article":
      return <ArticlePageContent navigate={navigate} />;
    default:
      return <LoadingPageContent />;
  }
};

// 导航历史项类型
interface NavigationHistoryItem {
  screen: ScreenName;
  params?: NavigationParams;
  sidebarConfig: SidebarConfig;
}

// 导航上下文类型
interface NavigationContextType {
  currentScreen: ScreenName;
  currentParams: NavigationParams;
  sidebarConfig: SidebarConfig;
  navigate: (
    screen: ScreenName,
    params?: NavigationParams,
    sidebarConfig?: SidebarConfig
  ) => void;
  goBack: () => void;
  canGoBack: () => boolean;
  updateSidebarConfig: (config: SidebarConfig) => void;
}

// 创建导航上下文
const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

// 导航 Hook
export const useSimpleNavigation = (): NavigationContextType => {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error(
      "useSimpleNavigation must be used within a SimpleNavigator"
    );
  }
  return ctx;
};

// 简单导航器组件
interface SimpleNavigatorProps {
  children: ReactNode;
}
const SimpleNavigator: React.FC<SimpleNavigatorProps> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>("Main");
  const [currentParams, setCurrentParams] = useState<NavigationParams>({});
  const [sidebarConfig, setSidebarConfig] = useState<SidebarConfig>({
    enabled: true,
    type: "default",
  });
  const [history, setHistory] = useState<NavigationHistoryItem[]>([
    {
      screen: "Main",
      params: {},
      sidebarConfig: { enabled: true, type: "default" },
    },
  ]);

  const navigate = (
    screen: ScreenName,
    params: NavigationParams = {},
    config: SidebarConfig = { enabled: true, type: "default" }
  ) => {
    setCurrentScreen(screen);
    setCurrentParams(params);
    setSidebarConfig(config);
    setHistory((prev) => [...prev, { screen, params, sidebarConfig: config }]);
  };

  const goBack = () => {
    if (history.length <= 1) return;
    const next = history.slice(0, -1);
    const last = next[next.length - 1];
    setHistory(next);
    setCurrentScreen(last.screen);
    setCurrentParams(last.params || {});
    setSidebarConfig(last.sidebarConfig);
  };

  const canGoBack = () => history.length > 1;

  const updateSidebarConfig = (config: SidebarConfig) => {
    setSidebarConfig(config);
    setHistory((prev) => {
      const copy = [...prev];
      copy[copy.length - 1] = {
        ...copy[copy.length - 1],
        sidebarConfig: config,
      };
      return copy;
    });
  };

  const value: NavigationContextType = {
    currentScreen,
    currentParams,
    sidebarConfig,
    navigate,
    goBack,
    canGoBack,
    updateSidebarConfig,
  };

  const renderScreen = () => {
    if (currentScreen === "Main") return <>{children}</>;
    const loader = screens[currentScreen as keyof typeof screens];
    if (!loader) return <>{children}</>;
    const Comp = loader();
    return <Comp {...currentParams} />;
  };

  return (
    <SafeAreaProvider>
      <NavigationContext.Provider value={value}>
        <View style={{ flex: 1 }}>{renderScreen()}</View>
      </NavigationContext.Provider>
    </SafeAreaProvider>
  );
};

export default SimpleNavigator;

const styles = StyleSheet.create({
  baseCard: {
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
  infoExtras: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  },
  itemList: {
    marginTop: 20,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
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
