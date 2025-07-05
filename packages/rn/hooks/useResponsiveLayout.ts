import { useState, useEffect, useRef } from "react";
import { Dimensions, Animated as RNAnimated } from "react-native";
import { DEFAULT_DRAWER_WIDTH } from "../components/shared/constants";

// 响应式布局Hook - 统一的逻辑
export const useResponsiveLayout = () => {
  const getInitialWidth = () => {
    const width = Dimensions.get("window").width;
    return width > 0 ? width : 1024;
  };

  const [screenWidth, setScreenWidth] = useState(getInitialWidth());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDesktopDrawerCollapsed, setIsDesktopDrawerCollapsed] =
    useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_DRAWER_WIDTH);

  const isLargeScreen = screenWidth >= 768;

  // 初始化时确保获取正确的屏幕尺寸
  useEffect(() => {
    const updateScreenWidth = () => {
      const width = Dimensions.get("window").width;
      if (width > 0) {
        setScreenWidth(width);
      }
    };

    updateScreenWidth();

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
  };
};

// 动画逻辑Hook
export const useDrawerAnimation = (
  isLargeScreen: boolean,
  isDrawerOpen: boolean,
  sidebarWidth: number
) => {
  const drawerTranslateX = useRef(new RNAnimated.Value(-sidebarWidth)).current;
  const overlayOpacity = useRef(new RNAnimated.Value(0)).current;

  useEffect(() => {
    if (!isLargeScreen && !isDrawerOpen) {
      drawerTranslateX.setValue(-sidebarWidth);
    }
  }, [sidebarWidth, isLargeScreen, isDrawerOpen]);

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
