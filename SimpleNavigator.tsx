import React, { useState, createContext, useContext, ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

// 导航类型定义
export type ScreenName = "Main" | "UserProfile" | "Settings" | "Recharge";

// 导航上下文类型
interface NavigationContextType {
  currentScreen: ScreenName;
  navigate: (screen: ScreenName) => void;
  goBack: () => void;
  canGoBack: () => boolean;
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

// 屏幕组件接口
interface ScreenProps {
  children?: ReactNode;
}

// 信息卡片组件
const InfoCard = ({ label, value }: { label: string; value: string }) => (
  <View style={screenStyles.infoCard}>
    <Text style={screenStyles.infoLabel}>{label}</Text>
    <Text style={screenStyles.infoValue}>{value}</Text>
  </View>
);

// 用户资料页面
const UserProfileScreen: React.FC<ScreenProps> = () => {
  const { goBack } = useSimpleNavigation();

  return (
    <View style={screenStyles.container}>
      <View style={screenStyles.header}>
        <TouchableOpacity style={screenStyles.backButton} onPress={goBack}>
          <Text style={screenStyles.backButtonText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={screenStyles.title}>👤 用户资料</Text>
      </View>

      <ScrollView style={screenStyles.content}>
        <InfoCard label="用户名:" value="用户001" />
        <InfoCard label="邮箱:" value="user001@example.com" />
        <InfoCard label="注册时间:" value="2024-12-01" />
        <InfoCard label="权限级别:" value="管理员" />
      </ScrollView>
    </View>
  );
};

// 设置页面
const SettingsScreen: React.FC<ScreenProps> = () => {
  const { goBack } = useSimpleNavigation();

  return (
    <View style={screenStyles.container}>
      <View style={screenStyles.header}>
        <TouchableOpacity style={screenStyles.backButton} onPress={goBack}>
          <Text style={screenStyles.backButtonText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={screenStyles.title}>⚙️ 设置</Text>
      </View>

      <ScrollView style={screenStyles.content}>
        <InfoCard label="主题设置:" value="浅色模式" />
        <InfoCard label="语言设置:" value="简体中文" />
        <InfoCard label="通知设置:" value="已开启" />
        <InfoCard label="自动保存:" value="已开启" />
      </ScrollView>
    </View>
  );
};

// 充值页面
const RechargeScreen: React.FC<ScreenProps> = () => {
  const { goBack } = useSimpleNavigation();
  const amounts = [10, 50, 100, 200, 500];

  return (
    <View style={screenStyles.container}>
      <View style={screenStyles.header}>
        <TouchableOpacity style={screenStyles.backButton} onPress={goBack}>
          <Text style={screenStyles.backButtonText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={screenStyles.title}>💰 充值</Text>
      </View>

      <ScrollView style={screenStyles.content}>
        <InfoCard label="当前余额:" value="¥128.50" />

        <View style={screenStyles.section}>
          <Text style={screenStyles.sectionTitle}>充值金额:</Text>
          <View style={screenStyles.amountGrid}>
            {amounts.map((amount) => (
              <TouchableOpacity key={amount} style={screenStyles.amountButton}>
                <Text style={screenStyles.amountText}>¥{amount}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={screenStyles.section}>
          <Text style={screenStyles.sectionTitle}>支付方式:</Text>
          <TouchableOpacity style={screenStyles.paymentOption}>
            <Text style={screenStyles.paymentText}>💰 支付宝</Text>
          </TouchableOpacity>
          <TouchableOpacity style={screenStyles.paymentOption}>
            <Text style={screenStyles.paymentText}>💚 微信支付</Text>
          </TouchableOpacity>
          <TouchableOpacity style={screenStyles.paymentOption}>
            <Text style={screenStyles.paymentText}>🏦 银行卡</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

// 屏幕样式
const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    height: 60,
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    marginRight: 15,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
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
  section: {
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 12,
  },
  amountGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  amountButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 4,
    backgroundColor: "#fff",
  },
  amountText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
  paymentOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  paymentText: {
    fontSize: 16,
    color: "#333",
  },
});

// 简单导航器组件
interface SimpleNavigatorProps {
  children: ReactNode;
}

const SimpleNavigator: React.FC<SimpleNavigatorProps> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ScreenName>("Main");
  const [navigationHistory, setNavigationHistory] = useState<ScreenName[]>([
    "Main",
  ]);

  const navigate = (screen: ScreenName) => {
    setCurrentScreen(screen);
    setNavigationHistory((prev) => [...prev, screen]);
  };

  const goBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = navigationHistory.slice(0, -1);
      setNavigationHistory(newHistory);
      setCurrentScreen(newHistory[newHistory.length - 1]);
    }
  };

  const canGoBack = () => {
    return navigationHistory.length > 1;
  };

  const navigationValue: NavigationContextType = {
    currentScreen,
    navigate,
    goBack,
    canGoBack,
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "UserProfile":
        return <UserProfileScreen />;
      case "Settings":
        return <SettingsScreen />;
      case "Recharge":
        return <RechargeScreen />;
      case "Main":
      default:
        return <>{children}</>;
    }
  };

  return (
    <NavigationContext.Provider value={navigationValue}>
      <View style={{ flex: 1 }}>{renderScreen()}</View>
    </NavigationContext.Provider>
  );
};

export default SimpleNavigator;
