import React, { useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";
import SimpleNavigator, {
  useSimpleNavigation,
  renderPageContent,
  PAGES,
  PageType,
} from "rn/SimpleNavigator";
import { createAppStore } from "rn/redux/store";
import { AppStateProvider, useAppState } from "rn/context/AppStateContext";
import EnhancedSidebarLayout from "rn/components/EnhancedSidebarLayout";
import ResponsiveHeader from "rn/components/shared/ResponsiveHeader";
import UserMenu from "rn/components/shared/UserMenu";
import { SidebarContentConfig } from "rn/components/shared/SidebarContentProvider";
import { useResponsiveLayout } from "rn/hooks/useResponsiveLayout";
import Level from "@nolotus/react-native-leveldb";
import { rnTokenManager } from "auth/rn/tokenManager";

const nativeDb = new Level("nolo", { valueEncoding: "json" });

const appStore = createAppStore({
  dbInstance: nativeDb,
  tokenManager: rnTokenManager,
});

const PageContent: React.FC = () => {
  const { navigate } = useSimpleNavigation();
  const {
    isLargeScreen,
    screenWidth,
    isDesktopDrawerCollapsed,
    isDrawerOpen,
    setIsDesktopDrawerCollapsed,
    setIsDrawerOpen,
  } = useResponsiveLayout();
  const { appState } = useAppState();
  const currentPage = appState.currentPage as PageType;

  const toggleSidebar = useCallback(() => {
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

  return (
    <View style={styles.pageContent}>
      <Text style={styles.pageTitle}>
        {PAGES[currentPage].icon} {PAGES[currentPage].title}
      </Text>

      {renderPageContent(
        currentPage,
        screenWidth,
        isLargeScreen,
        navigate,
        isDesktopDrawerCollapsed,
        isDrawerOpen
      )}

      <TouchableOpacity style={styles.actionButton} onPress={toggleSidebar}>
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

const InnerApp: React.FC = () => {
  const layout = useResponsiveLayout();
  const { appState, setCurrentPage, setSelectedSpace } = useAppState();

  const sidebarConfig: SidebarContentConfig = {
    type: "app",
    appConfig: {
      currentPage: appState.currentPage,
      onPageChange: setCurrentPage,
      selectedSpace: appState.selectedSpace,
      onSpaceChange: setSelectedSpace,
    },
  };

  const handleToggleSidebar = useCallback(() => {
    if (layout.isLargeScreen) {
      layout.setIsDesktopDrawerCollapsed(!layout.isDesktopDrawerCollapsed);
    } else {
      layout.setIsDrawerOpen(!layout.isDrawerOpen);
    }
  }, [
    layout.isLargeScreen,
    layout.isDesktopDrawerCollapsed,
    layout.isDrawerOpen,
    layout.setIsDesktopDrawerCollapsed,
    layout.setIsDrawerOpen,
  ]);

  const userInfo = { name: "用户001", email: "user001@example.com" };

  return (
    <EnhancedSidebarLayout
      sidebarContentConfig={sidebarConfig}
      externalLayoutState={layout}
    >
      <View style={styles.container}>
        <ResponsiveHeader
          title="React Native App"
          isLargeScreen={layout.isLargeScreen}
          isDesktopDrawerCollapsed={layout.isDesktopDrawerCollapsed}
          isDrawerOpen={layout.isDrawerOpen}
          onToggleSidebar={handleToggleSidebar}
          rightActions={<UserMenu userInfo={userInfo} />}
        />
        <PageContent />
      </View>
    </EnhancedSidebarLayout>
  );
};

const MacOSApp: React.FC = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <Provider store={appStore}>
      <AppStateProvider>
        <SimpleNavigator>
          <InnerApp />
        </SimpleNavigator>
      </AppStateProvider>
    </Provider>
  </GestureHandlerRootView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
  actionButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: "center",
    marginVertical: 20,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default MacOSApp;
