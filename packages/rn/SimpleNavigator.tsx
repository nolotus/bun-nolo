import React, {
  useState,
  createContext,
  useContext,
  ReactNode,
  useRef,
  useEffect,
} from "react";
import { View, Animated } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import UserProfileScreen from "./screens/UserProfileScreen";
import SettingsScreen from "./screens/SettingsScreen";
import RechargeScreen from "./screens/RechargeScreen";
import ChatDetailScreen from "./screens/ChatDetailScreen";
import ArticleDetailScreen from "./screens/ArticleDetailScreen";
import AboutScreen from "./screens/AboutScreen";
import DataScreen from "./screens/DataScreen";

// 导航类型定义
export type ScreenName =
  | "Main"
  | "UserProfile"
  | "Settings"
  | "Recharge"
  | "ChatDetail"
  | "ArticleDetail"
  | "About"
  | "Data";

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

// 导航Hook
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

    const historyItem: NavigationHistoryItem = {
      screen,
      params: newParams,
      sidebarConfig: newSidebarConfig,
    };

    setNavigationHistory((prev) => [...prev, historyItem]);
  };

  const goBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = navigationHistory.slice(0, -1);
      const previousItem = newHistory[newHistory.length - 1];

      setNavigationHistory(newHistory);
      setCurrentScreen(previousItem.screen);
      setCurrentParams(previousItem.params || {});
      setSidebarConfig(
        previousItem.sidebarConfig || { enabled: true, type: "default" }
      );
    }
  };

  const canGoBack = () => {
    return navigationHistory.length > 1;
  };

  const updateSidebarConfig = (config: SidebarConfig) => {
    setSidebarConfig(config);
    // 更新当前历史项的侧边栏配置
    setNavigationHistory((prev) => {
      const newHistory = [...prev];
      if (newHistory.length > 0) {
        newHistory[newHistory.length - 1] = {
          ...newHistory[newHistory.length - 1],
          sidebarConfig: config,
        };
      }
      return newHistory;
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
    switch (currentScreen) {
      case "UserProfile":
        return <UserProfileScreen />;
      case "Settings":
        return <SettingsScreen />;
      case "Recharge":
        return <RechargeScreen />;
      case "ChatDetail":
        return <ChatDetailScreen />;
      case "ArticleDetail":
        return <ArticleDetailScreen />;
      case "About":
        return <AboutScreen />;
      case "Data":
        return <DataScreen />;
      case "Main":
      default:
        return <>{children}</>;
    }
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
