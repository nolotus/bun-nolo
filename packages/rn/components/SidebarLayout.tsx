import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  Animated as RNAnimated,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSimpleNavigation } from "../SimpleNavigator";
import ResizeHandle from "./shared/ResizeHandle";
import { DEFAULT_DRAWER_WIDTH } from "./shared/constants";
import SidebarContentProvider, {
  SidebarContentConfig,
} from "./shared/SidebarContentProvider";

// 侧边栏布局组件
interface SidebarLayoutProps {
  children: React.ReactNode;
  sidebarContent?: React.ReactNode; // 保持向后兼容
  sidebarEnabled?: boolean;
  sidebarContentConfig?: SidebarContentConfig; // 新的配置方式
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  children,
  sidebarContent,
  sidebarEnabled = true,
  sidebarContentConfig,
}) => {
  const { sidebarConfig, updateSidebarConfig } = useSimpleNavigation();
  const insets = useSafeAreaInsets();

  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get("window").width
  );
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDesktopDrawerCollapsed, setIsDesktopDrawerCollapsed] =
    useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_DRAWER_WIDTH);

  const isLargeScreen = screenWidth >= 768;
  const shouldShowSidebar = sidebarEnabled && sidebarConfig.enabled;

  // 响应sidebarConfig变化
  useEffect(() => {
    if (isLargeScreen) {
      setIsDesktopDrawerCollapsed(!sidebarConfig.enabled);
    } else {
      setIsDrawerOpen(sidebarConfig.enabled);
    }
  }, [sidebarConfig.enabled, isLargeScreen]);

  // 动画值
  const drawerTranslateX = useRef(new RNAnimated.Value(-sidebarWidth)).current;
  const overlayOpacity = useRef(new RNAnimated.Value(0)).current;

  // 监听屏幕尺寸变化
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  // 处理动画
  useEffect(() => {
    if (!isLargeScreen && shouldShowSidebar) {
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
    }
  }, [isDrawerOpen, isLargeScreen, sidebarWidth, shouldShowSidebar]);

  const toggleDrawer = () => {
    const newEnabled = !sidebarConfig.enabled;
    updateSidebarConfig({
      ...sidebarConfig,
      enabled: newEnabled,
    });
  };

  const handleResizeSidebar = (newWidth: number) => {
    setSidebarWidth(newWidth);
  };

  // 渲染侧边栏内容
  const renderSidebarContent = () => {
    if (sidebarContentConfig) {
      return <SidebarContentProvider config={sidebarContentConfig} />;
    }
    return sidebarContent;
  };

  if (!shouldShowSidebar) {
    // 不显示侧边栏时，直接返回子组件
    return (
      <GestureHandlerRootView style={styles.container}>
        <View style={styles.fullContent}>{children}</View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.layout}>
        {/* 桌面端侧边栏 */}
        {isLargeScreen && !isDesktopDrawerCollapsed && (
          <View style={[styles.desktopSidebar, { width: sidebarWidth }]}>
            {renderSidebarContent()}
            <ResizeHandle
              onResize={handleResizeSidebar}
              currentWidth={sidebarWidth}
            />
          </View>
        )}

        {/* 主内容区域 */}
        <View style={styles.mainContent}>{children}</View>

        {/* 移动端侧边栏 */}
        {!isLargeScreen && (
          <>
            <RNAnimated.View
              style={[
                styles.mobileSidebar,
                {
                  width: sidebarWidth,
                  transform: [{ translateX: drawerTranslateX }],
                  pointerEvents: isDrawerOpen ? "auto" : "none",
                  top: insets.top,
                  bottom: insets.bottom,
                },
              ]}
            >
              {renderSidebarContent()}
            </RNAnimated.View>

            {/* 遮罩层 */}
            {isDrawerOpen && (
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
                  onPress={toggleDrawer}
                  activeOpacity={1}
                />
              </RNAnimated.View>
            )}
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
  layout: {
    flex: 1,
    flexDirection: "row",
  },
  fullContent: {
    flex: 1,
  },
  desktopSidebar: {
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
    backgroundColor: "#fff",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000,
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
    zIndex: 999,
  },
  overlayTouchable: {
    flex: 1,
  },
});

export default SidebarLayout;
