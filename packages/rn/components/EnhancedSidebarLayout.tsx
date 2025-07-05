import React from "react";
import {
  View,
  StyleSheet,
  Animated as RNAnimated,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  useResponsiveLayout,
  useDrawerAnimation,
} from "../hooks/useResponsiveLayout";
import ResizeHandle from "./shared/ResizeHandle";
import { DEFAULT_DRAWER_WIDTH } from "./shared/constants";
import SidebarContentProvider, {
  SidebarContentConfig,
} from "./shared/SidebarContentProvider";
import { Z_INDEX } from "../zIndexLayers";

// 增强的侧边栏布局组件 - 统一处理所有响应式逻辑
interface EnhancedSidebarLayoutProps {
  children: React.ReactNode;
  sidebarContentConfig: SidebarContentConfig;
  // 可选的自定义状态管理
  externalLayoutState?: {
    screenWidth: number;
    isDrawerOpen: boolean;
    setIsDrawerOpen: (open: boolean) => void;
    isDesktopDrawerCollapsed: boolean;
    setIsDesktopDrawerCollapsed: (collapsed: boolean) => void;
    sidebarWidth: number;
    setSidebarWidth: (width: number) => void;
    isLargeScreen: boolean;
  };
  // 可选的切换函数覆盖
  onToggleSidebar?: () => void;
}

const EnhancedSidebarLayout: React.FC<EnhancedSidebarLayoutProps> = ({
  children,
  sidebarContentConfig,
  externalLayoutState,
  onToggleSidebar,
}) => {
  const insets = useSafeAreaInsets();

  // 使用外部状态或内部状态
  const internalLayoutState = useResponsiveLayout();
  const layoutState = externalLayoutState || internalLayoutState;

  const {
    screenWidth,
    isDrawerOpen,
    setIsDrawerOpen,
    isDesktopDrawerCollapsed,
    setIsDesktopDrawerCollapsed,
    sidebarWidth,
    setSidebarWidth,
    isLargeScreen,
  } = layoutState;

  const { drawerTranslateX, overlayOpacity } = useDrawerAnimation(
    isLargeScreen,
    isDrawerOpen,
    sidebarWidth
  );

  // 默认的切换逻辑
  const defaultToggleSidebar = () => {
    if (isLargeScreen) {
      setIsDesktopDrawerCollapsed(!isDesktopDrawerCollapsed);
    } else {
      const newState = !isDrawerOpen;
      setIsDrawerOpen(newState);
    }
  };

  const toggleSidebar = onToggleSidebar || defaultToggleSidebar;

  const handleResizeSidebar = (newWidth: number) => {
    setSidebarWidth(newWidth);
  };

  // 渲染桌面端侧边栏
  const renderDesktopSidebar = () => {
    if (isDesktopDrawerCollapsed) return null;

    return (
      <View style={[styles.desktopSidebar, { width: sidebarWidth }]}>
        <SidebarContentProvider config={sidebarContentConfig} />
        <ResizeHandle
          onResize={handleResizeSidebar}
          currentWidth={sidebarWidth}
        />
      </View>
    );
  };

  // 渲染移动端侧边栏
  const renderMobileSidebar = () => {
    // 计算header的总高度：安全区域顶部 + header基础高度
    const headerTotalHeight = insets.top + 60;

    return (
      <RNAnimated.View
        style={[
          styles.mobileSidebar,
          {
            width: sidebarWidth,
            transform: [{ translateX: drawerTranslateX }],
            pointerEvents: isDrawerOpen ? "auto" : "none",
            top: headerTotalHeight, // 动态计算，避免被header遮挡
            bottom: insets.bottom,
          },
        ]}
      >
        <SidebarContentProvider config={sidebarContentConfig} />
      </RNAnimated.View>
    );
  };

  // 渲染遮罩层
  const renderOverlay = () => (
    <RNAnimated.View
      style={[
        styles.overlay,
        {
          opacity: overlayOpacity,
          pointerEvents: isDrawerOpen ? "auto" : "none",
        },
      ]}
    >
      <TouchableOpacity
        style={styles.overlayTouchable}
        onPress={toggleSidebar}
        activeOpacity={1}
      />
    </RNAnimated.View>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.appLayout}>
        {/* 桌面端布局 */}
        {isLargeScreen ? (
          <>
            {renderDesktopSidebar()}
            <View style={styles.mainContent}>{children}</View>
          </>
        ) : (
          /* 移动端布局 */
          <>
            <View style={styles.mainContent}>{children}</View>
            {renderMobileSidebar()}
            {isDrawerOpen && renderOverlay()}
          </>
        )}
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  appLayout: {
    flex: 1,
    flexDirection: "row",
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
    zIndex: Z_INDEX.RN_SIDEBAR_MOBILE, // 提高zIndex，确保在header之上
  },
  mainContent: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: Z_INDEX.RN_SIDEBAR_OVERLAY, // 在header之上，但在侧边栏之下
  },
  overlayTouchable: {
    flex: 1,
  },
});

export default EnhancedSidebarLayout;
