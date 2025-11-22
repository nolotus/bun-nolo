import React, { useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  Animated as RNAnimated,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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

interface EnhancedSidebarLayoutProps {
  children: React.ReactNode;
  sidebarContentConfig: SidebarContentConfig;
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
  onToggleSidebar?: () => void;
}

const EnhancedSidebarLayout: React.FC<EnhancedSidebarLayoutProps> = ({
  children,
  sidebarContentConfig,
  externalLayoutState,
  onToggleSidebar,
}) => {
  const insets = useSafeAreaInsets();

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

  const defaultToggleSidebar = useCallback(() => {
    if (isLargeScreen) {
      setIsDesktopDrawerCollapsed(!isDesktopDrawerCollapsed);
    } else {
      setIsDrawerOpen(!isDrawerOpen);
    }
  }, [
    isLargeScreen,
    isDesktopDrawerCollapsed,
    isDrawerOpen,
    setIsDesktopDrawerCollapsed,
    setIsDrawerOpen,
  ]);

  const toggleSidebar = onToggleSidebar || defaultToggleSidebar;

  const handleResizeSidebar = useCallback(
    (newWidth: number) => {
      setSidebarWidth(newWidth);
    },
    [setSidebarWidth]
  );

  const headerTotalHeight = useMemo(() => insets.top + 60, [insets.top]);

  const desktopSidebar = useMemo(() => {
    if (isDesktopDrawerCollapsed) {
      return <View style={[styles.desktopSidebarPlaceholder]} />;
    }

    return (
      <View style={[styles.desktopSidebar, { width: sidebarWidth }]}>
        <SidebarContentProvider config={sidebarContentConfig} />
        <ResizeHandle
          onResize={handleResizeSidebar}
          currentWidth={sidebarWidth}
        />
      </View>
    );
  }, [
    isDesktopDrawerCollapsed,
    sidebarWidth,
    sidebarContentConfig,
    handleResizeSidebar,
  ]);

  const mobileSidebar = useMemo(
    () => (
      <RNAnimated.View
        style={[
          styles.mobileSidebar,
          {
            width: sidebarWidth,
            transform: [{ translateX: drawerTranslateX }],
            pointerEvents: isDrawerOpen ? "auto" : "none",
            top: headerTotalHeight,
            bottom: insets.bottom,
          },
        ]}
      >
        <SidebarContentProvider config={sidebarContentConfig} />
      </RNAnimated.View>
    ),
    [
      sidebarWidth,
      drawerTranslateX,
      isDrawerOpen,
      headerTotalHeight,
      insets.bottom,
      sidebarContentConfig,
    ]
  );

  const overlay = useMemo(
    () => (
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
    ),
    [overlayOpacity, isDrawerOpen, toggleSidebar]
  );

  return (
    <View style={styles.container}>
      <View style={styles.appLayout}>
        {isLargeScreen ? (
          <>
            {desktopSidebar}
            <View style={styles.mainContent}>{children}</View>
          </>
        ) : (
          <>
            <View style={styles.mainContent}>{children}</View>
            {mobileSidebar}
            {isDrawerOpen && overlay}
          </>
        )}
      </View>
    </View>
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
  desktopSidebarPlaceholder: {
    width: 0,
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
    zIndex: Z_INDEX.RN_SIDEBAR_MOBILE,
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
    zIndex: Z_INDEX.RN_SIDEBAR_OVERLAY,
  },
  overlayTouchable: {
    flex: 1,
  },
});

export default EnhancedSidebarLayout;
