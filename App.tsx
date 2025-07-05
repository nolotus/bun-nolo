import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated as RNAnimated,
} from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  GestureHandlerRootView,
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import Animated, { runOnJS } from "react-native-reanimated";
import SidebarHeaderComponent from "./SidebarHeader";
import UserDropdownMenu from "auth/rn/UserDropdownMenu";
import SimpleNavigator from "./SimpleNavigator";
import { Z_INDEX } from "./zIndexLayers";

// 页面类型定义
export type PageType = "chat" | "article" | "about" | "data";

const DEFAULT_DRAWER_WIDTH = 260;
const MIN_DRAWER_WIDTH = 200;
const MAX_DRAWER_WIDTH = 400;

// 页面配置
const PAGES = {
  chat: { title: "对话", icon: "💬" },
  article: { title: "文章", icon: "📝" },
  about: { title: "关于", icon: "ℹ️" },
  data: { title: "数据", icon: "📊" },
};

// Resize手柄组件
interface ResizeHandleProps {
  onResize: (width: number) => void;
  currentWidth: number;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({
  onResize,
  currentWidth,
}) => {
  const [startWidth, setStartWidth] = useState(currentWidth);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(setStartWidth)(currentWidth);
    })
    .onUpdate((event) => {
      const newWidth = Math.max(
        MIN_DRAWER_WIDTH,
        Math.min(MAX_DRAWER_WIDTH, startWidth + event.translationX)
      );
      runOnJS(onResize)(newWidth);
    })
    .runOnJS(true);

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.resizeHandle}>
        <View style={styles.resizeIndicator} />
      </View>
    </GestureDetector>
  );
};

// 侧边栏内容组件 - 接收导航相关props
interface SidebarContentProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  selectedSpace: string;
  onSpaceChange: (space: string) => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
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

// 顶部导航栏组件 - 接收props，低耦合
interface TopBarProps {
  isLargeScreen: boolean;
  isDesktopDrawerCollapsed: boolean;
  isDrawerOpen?: boolean;
  onToggleDrawer: () => void;
  onPageChange: (page: PageType) => void;
}

const TopBar: React.FC<TopBarProps> = ({
  isLargeScreen,
  isDesktopDrawerCollapsed,
  isDrawerOpen,
  onToggleDrawer,
  onPageChange,
}) => {
  // 模拟用户信息
  const userInfo = {
    name: "用户001",
    email: "user001@example.com",
  };
  const insets = useSafeAreaInsets();

  const getMenuIcon = () => {
    if (isLargeScreen) {
      return isDesktopDrawerCollapsed ? "☰" : "✕";
    } else {
      return isDrawerOpen ? "✕" : "☰";
    }
  };

  const handleMenuButtonPress = () => {
    console.log("Menu button pressed! isLargeScreen:", isLargeScreen);
    onToggleDrawer();
  };

  return (
    <View
      style={[
        styles.topBar,
        { height: 60 + insets.top, paddingTop: insets.top },
      ]}
    >
      <View style={styles.topBarLeft}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={handleMenuButtonPress}
          activeOpacity={0.7}
        >
          <Text style={styles.menuIcon}>{getMenuIcon()}</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>React Native App</Text>
      </View>

      <View style={styles.topBarRight}>
        <UserDropdownMenu userInfo={userInfo} />
      </View>
    </View>
  );
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
        </View>
      );
    case "article":
      return (
        <View>
          <InfoCard label="总文章数:" value="42" />
          <Text style={styles.description}>在这里浏览和管理您的文章。</Text>
        </View>
      );
    case "about":
      return (
        <View>
          <InfoCard label="应用版本:" value="1.0.0" />
          <InfoCard label="构建时间:" value="2025-01-05" />
          <InfoCard label="开发者:" value="Nolo Team" />
          <Text style={styles.description}>
            这是一个响应式的React Native应用，支持桌面和移动端。
          </Text>
        </View>
      );
    case "data":
      return (
        <View>
          <InfoCard label="数据总量:" value="1,234 条" />
          <InfoCard label="存储空间:" value="45.6 MB" />
          <InfoCard label="最后同步:" value="刚刚" />
          <Text style={styles.description}>查看和管理应用数据统计信息。</Text>
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

  return (
    <View style={styles.pageContent}>
      <Text style={styles.pageTitle}>
        {pageInfo.icon} {pageInfo.title}
      </Text>

      {renderPageContent(
        currentPage,
        screenWidth,
        isLargeScreen,
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

// 桌面端侧边栏组件 - 条件渲染容器，支持resize
interface DesktopSidebarProps {
  isCollapsed: boolean;
  width: number;
  onResize: (width: number) => void;
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  selectedSpace: string;
  onSpaceChange: (space: string) => void;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  isCollapsed,
  width,
  onResize,
  currentPage,
  onPageChange,
  selectedSpace,
  onSpaceChange,
}) => {
  if (isCollapsed) return null;

  return (
    <View style={[styles.desktopSidebar, { width }]}>
      <SidebarContent
        currentPage={currentPage}
        onPageChange={onPageChange}
        selectedSpace={selectedSpace}
        onSpaceChange={onSpaceChange}
      />
      <ResizeHandle onResize={onResize} currentWidth={width} />
    </View>
  );
};

// 移动端侧边栏组件 - 动画容器
interface MobileSidebarProps {
  isDrawerOpen: boolean;
  translateX: RNAnimated.Value;
  width: number;
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  selectedSpace: string;
  onSpaceChange: (space: string) => void;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({
  isDrawerOpen,
  translateX,
  width,
  currentPage,
  onPageChange,
  selectedSpace,
  onSpaceChange,
}) => {
  const insets = useSafeAreaInsets();
  return (
    <RNAnimated.View
      style={[
        styles.mobileSidebar,
        {
          width,
          transform: [{ translateX }],
          pointerEvents: isDrawerOpen ? "auto" : "none",
          top: insets.top,
          bottom: insets.bottom,
        },
      ]}
    >
      <SidebarContent
        currentPage={currentPage}
        onPageChange={onPageChange}
        selectedSpace={selectedSpace}
        onSpaceChange={onSpaceChange}
      />
    </RNAnimated.View>
  );
};

// 遮罩层组件 - 独立的交互组件
interface OverlayProps {
  opacity: RNAnimated.Value;
  isVisible: boolean;
  onPress: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ opacity, isVisible, onPress }) => (
  <RNAnimated.View
    style={[
      styles.overlay,
      {
        opacity,
        pointerEvents: isVisible ? "auto" : "none",
      },
    ]}
    pointerEvents={isVisible ? "auto" : "none"}
  >
    <TouchableOpacity
      style={styles.overlayTouchable}
      onPress={onPress}
      activeOpacity={1}
    />
  </RNAnimated.View>
);

// 桌面端布局组件 - 组合桌面端相关组件
interface DesktopLayoutProps {
  isDesktopDrawerCollapsed: boolean;
  screenWidth: number;
  sidebarWidth: number;
  onToggleDrawer: () => void;
  onResizeSidebar: (width: number) => void;
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  selectedSpace: string;
  onSpaceChange: (space: string) => void;
}

const DesktopLayout: React.FC<DesktopLayoutProps> = ({
  isDesktopDrawerCollapsed,
  screenWidth,
  sidebarWidth,
  onToggleDrawer,
  onResizeSidebar,
  currentPage,
  onPageChange,
  selectedSpace,
  onSpaceChange,
}) => (
  <>
    <DesktopSidebar
      isCollapsed={isDesktopDrawerCollapsed}
      width={sidebarWidth}
      onResize={onResizeSidebar}
      currentPage={currentPage}
      onPageChange={onPageChange}
      selectedSpace={selectedSpace}
      onSpaceChange={onSpaceChange}
    />

    <View style={styles.mainContent}>
      <TopBar
        isLargeScreen={true}
        isDesktopDrawerCollapsed={isDesktopDrawerCollapsed}
        onToggleDrawer={onToggleDrawer}
        onPageChange={onPageChange}
      />

      <PageContent
        screenWidth={screenWidth}
        isLargeScreen={true}
        isDesktopDrawerCollapsed={isDesktopDrawerCollapsed}
        onToggleDrawer={onToggleDrawer}
        currentPage={currentPage}
      />
    </View>
  </>
);

// 移动端布局组件 - 组合移动端相关组件
interface MobileLayoutProps {
  isDrawerOpen: boolean;
  screenWidth: number;
  sidebarWidth: number;
  drawerTranslateX: RNAnimated.Value;
  overlayOpacity: RNAnimated.Value;
  onToggleDrawer: () => void;
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
  selectedSpace: string;
  onSpaceChange: (space: string) => void;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({
  isDrawerOpen,
  screenWidth,
  sidebarWidth,
  drawerTranslateX,
  overlayOpacity,
  onToggleDrawer,
  currentPage,
  onPageChange,
  selectedSpace,
  onSpaceChange,
}) => (
  <>
    <View style={styles.mainContent}>
      <TopBar
        isLargeScreen={false}
        isDesktopDrawerCollapsed={false}
        isDrawerOpen={isDrawerOpen}
        onToggleDrawer={onToggleDrawer}
        onPageChange={onPageChange}
      />

      <PageContent
        screenWidth={screenWidth}
        isLargeScreen={false}
        isDrawerOpen={isDrawerOpen}
        onToggleDrawer={onToggleDrawer}
        currentPage={currentPage}
      />
    </View>

    <MobileSidebar
      isDrawerOpen={isDrawerOpen}
      translateX={drawerTranslateX}
      width={sidebarWidth}
      currentPage={currentPage}
      onPageChange={onPageChange}
      selectedSpace={selectedSpace}
      onSpaceChange={onSpaceChange}
    />

    {isDrawerOpen && (
      <Overlay
        opacity={overlayOpacity}
        isVisible={isDrawerOpen}
        onPress={onToggleDrawer}
      />
    )}
  </>
);

// 响应式逻辑Hook - 分离状态管理逻辑
const useResponsiveLayout = () => {
  // 获取初始屏幕尺寸，如果为0则使用默认值
  const getInitialWidth = () => {
    const width = Dimensions.get("window").width;
    return width > 0 ? width : 1024; // 默认桌面宽度
  };

  const [screenWidth, setScreenWidth] = useState(getInitialWidth());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDesktopDrawerCollapsed, setIsDesktopDrawerCollapsed] =
    useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_DRAWER_WIDTH);
  const [currentPage, setCurrentPage] = useState<PageType>("chat");
  const [selectedSpace, setSelectedSpace] = useState("个人空间");

  const isLargeScreen = screenWidth >= 768;

  // 初始化时确保获取正确的屏幕尺寸
  useEffect(() => {
    const updateScreenWidth = () => {
      const width = Dimensions.get("window").width;
      if (width > 0) {
        setScreenWidth(width);
      }
    };

    // 立即检查一次
    updateScreenWidth();

    // 如果初始宽度为0，设置一个短暂的延迟再次检查
    if (screenWidth === 0) {
      const timer = setTimeout(updateScreenWidth, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  // 监听窗口尺寸变化
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      if (window.width > 0) {
        setScreenWidth(window.width);
      }
    });
    return () => subscription?.remove();
  }, []);

  // 重置状态当屏幕尺寸变化时
  useEffect(() => {
    if (isLargeScreen) {
      setIsDrawerOpen(true);
    } else {
      setIsDrawerOpen(false);
      setIsDesktopDrawerCollapsed(false);
    }
  }, [isLargeScreen]);

  return {
    screenWidth,
    isDrawerOpen,
    setIsDrawerOpen,
    isDesktopDrawerCollapsed,
    setIsDesktopDrawerCollapsed,
    sidebarWidth,
    setSidebarWidth,
    isLargeScreen,
    currentPage,
    setCurrentPage,
    selectedSpace,
    setSelectedSpace,
  };
};

// 动画逻辑Hook - 分离动画管理
const useDrawerAnimation = (
  isLargeScreen: boolean,
  isDrawerOpen: boolean,
  sidebarWidth: number
) => {
  // 使用useRef来保持动画值的引用，避免重复创建
  const drawerTranslateX = useRef(new RNAnimated.Value(-sidebarWidth)).current;
  const overlayOpacity = useRef(new RNAnimated.Value(0)).current;

  // 当sidebarWidth变化时，更新drawerTranslateX的值（如果抽屉是关闭状态）
  useEffect(() => {
    if (!isLargeScreen && !isDrawerOpen) {
      drawerTranslateX.setValue(-sidebarWidth);
    }
  }, [sidebarWidth, isLargeScreen, isDrawerOpen]);

  // 处理小屏幕下的抽屉状态变化
  useEffect(() => {
    if (!isLargeScreen) {
      const animation = RNAnimated.parallel([
        RNAnimated.timing(drawerTranslateX, {
          toValue: isDrawerOpen ? 0 : -sidebarWidth,
          duration: 300,
          useNativeDriver: true,
        }),
        RNAnimated.timing(overlayOpacity, {
          toValue: isDrawerOpen ? 0.5 : 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]);

      animation.start();

      return () => {
        animation.stop();
      };
    }
  }, [isDrawerOpen, isLargeScreen, sidebarWidth]);

  return { drawerTranslateX, overlayOpacity };
};

// 内部应用组件 - 不包含NavigationContainer
const InnerApp = () => {
  const {
    screenWidth,
    isDrawerOpen,
    setIsDrawerOpen,
    isDesktopDrawerCollapsed,
    setIsDesktopDrawerCollapsed,
    sidebarWidth,
    setSidebarWidth,
    isLargeScreen,
    currentPage,
    setCurrentPage,
    selectedSpace,
    setSelectedSpace,
  } = useResponsiveLayout();

  const { drawerTranslateX, overlayOpacity } = useDrawerAnimation(
    isLargeScreen,
    isDrawerOpen,
    sidebarWidth
  );

  const toggleDrawer = () => {
    console.log(
      "toggleDrawer called, isLargeScreen:",
      isLargeScreen,
      "isDesktopDrawerCollapsed:",
      isDesktopDrawerCollapsed,
      "isDrawerOpen:",
      isDrawerOpen,
      "screenWidth:",
      screenWidth
    );

    if (isLargeScreen) {
      // 桌面端：直接切换状态，无动画
      console.log("Desktop mode: toggling collapsed state");
      setIsDesktopDrawerCollapsed(!isDesktopDrawerCollapsed);
    } else {
      // 移动端：使用动画
      console.log("Mobile mode: toggling drawer state");
      const newState = !isDrawerOpen;
      setIsDrawerOpen(newState);
    }
  };

  const handleResizeSidebar = (newWidth: number) => {
    setSidebarWidth(newWidth);
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.appLayout}>
        {isLargeScreen ? (
          <DesktopLayout
            isDesktopDrawerCollapsed={isDesktopDrawerCollapsed}
            screenWidth={screenWidth}
            sidebarWidth={sidebarWidth}
            onToggleDrawer={toggleDrawer}
            onResizeSidebar={handleResizeSidebar}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            selectedSpace={selectedSpace}
            onSpaceChange={setSelectedSpace}
          />
        ) : (
          <MobileLayout
            isDrawerOpen={isDrawerOpen}
            screenWidth={screenWidth}
            sidebarWidth={sidebarWidth}
            drawerTranslateX={drawerTranslateX}
            overlayOpacity={overlayOpacity}
            onToggleDrawer={toggleDrawer}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            selectedSpace={selectedSpace}
            onSpaceChange={setSelectedSpace}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
};

// 主应用组件 - 包含SimpleNavigator
const MacOSApp = () => {
  return (
    <SafeAreaProvider>
      <SimpleNavigator>
        <InnerApp />
      </SimpleNavigator>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  appLayout: {
    flex: 1,
    flexDirection: "row", // 桌面端使用 row 布局
  },
  desktopSidebar: {
    width: DEFAULT_DRAWER_WIDTH,
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mobileSidebar: {
    position: "absolute",
    left: 0,
    width: DEFAULT_DRAWER_WIDTH,
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: Z_INDEX.SIDEBAR_MOBILE,
  },
  sidebarContent: {
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
  mainContent: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  topBar: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: Z_INDEX.TOPBAR, // 确保topBar在所有元素之上
    position: "relative",
  },
  topBarLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  topBarRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuButton: {
    padding: 12,
    marginRight: 15,
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
  },
  menuIcon: {
    fontSize: 24,
    color: "#fff",
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
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
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: Z_INDEX.SIDEBAR_OVERLAY,
  },
  overlayTouchable: {
    flex: 1,
  },
  resizeHandle: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 8,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  resizeIndicator: {
    width: 2,
    height: 40,
    backgroundColor: "#007AFF",
    borderRadius: 1,
    opacity: 0.6,
  },
  // 导航区域样式
  navigationSection: {
    flex: 1,
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

export default MacOSApp;
