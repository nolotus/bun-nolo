import React, {
  useState,
  createContext,
  useContext,
  ReactNode,
  useRef,
  useEffect,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
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

// 页面配置
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
  <View style={styles.infoCard}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

// 样式
const styles = StyleSheet.create({
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
      return (
        <View>
          <InfoCard label="Redux状态:" value="已集成" />
          <Text style={styles.description}>
            这里展示Redux Toolkit的使用示例。
          </Text>
          <TouchableOpacity
            style={styles.listItem}
            onPress={() =>
              navigate(
                "HomeScreen",
                { title: "Redux认证演示" },
                { enabled: false }
              )
            }
          >
            <Text style={styles.listItemTitle}>🏠 Redux认证演示</Text>
            <Text style={styles.listItemSubtitle}>
              使用Redux Toolkit进行用户认证管理
            </Text>
          </TouchableOpacity>
        </View>
      );
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

// 导航历史项类型
interface NavigationHistoryItem {
  screen: ScreenName;
  params?: NavigationParams;
  sidebarConfig?: SidebarConfig;
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
export const useSimpleNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error(
      "useSimpleNavigation must be used within a SimpleNavigator"
    );
  }
  return context;
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
  const [navigationHistory, setNavigationHistory] = useState<
    NavigationHistoryItem[]
  >([
    {
      screen: "Main",
      params: {},
      sidebarConfig: { enabled: true, type: "default" },
    },
  ]);

  const navigate = (
    screen: ScreenName,
    params?: NavigationParams,
    sidebarConfig?: SidebarConfig
  ) => {
    const newParams = params || {};
    const newSidebarConfig = sidebarConfig || {
      enabled: true,
      type: "default",
    };

    setCurrentScreen(screen);
    setCurrentParams(newParams);
    setSidebarConfig(newSidebarConfig);
    setNavigationHistory((prev) => [
      ...prev,
      { screen, params: newParams, sidebarConfig: newSidebarConfig },
    ]);
  };

  const goBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = navigationHistory.slice(0, -1);
      const previous = newHistory[newHistory.length - 1];
      setNavigationHistory(newHistory);
      setCurrentScreen(previous.screen);
      setCurrentParams(previous.params || {});
      setSidebarConfig(previous.sidebarConfig!);
    }
  };

  const canGoBack = () => navigationHistory.length > 1;

  const updateSidebarConfig = (config: SidebarConfig) => {
    setSidebarConfig(config);
    setNavigationHistory((prev) => {
      const copy = [...prev];
      copy[copy.length - 1] = {
        ...copy[copy.length - 1],
        sidebarConfig: config,
      };
      return copy;
    });
  };

  const navigationValue: NavigationContextType = {
    currentScreen,
    currentParams,
    sidebarConfig,
    navigate,
    goBack,
    canGoBack,
    updateSidebarConfig,
  };

  const renderScreen = () => {
    if (currentScreen === "Main") {
      return <>{children}</>;
    }
    const ScreenLoader = screens[currentScreen as keyof typeof screens];
    if (ScreenLoader) {
      const Component = ScreenLoader();
      return <Component {...currentParams} />;
    }
    return <>{children}</>;
  };

  return (
    <SafeAreaProvider>
      <NavigationContext.Provider value={navigationValue}>
        <View style={{ flex: 1 }}>{renderScreen()}</View>
      </NavigationContext.Provider>
    </SafeAreaProvider>
  );
};

export default SimpleNavigator;
