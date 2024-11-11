// MainLayout.tsx
import React, { Suspense } from "react";
import { useLocation, Outlet } from "react-router-dom";
import Sidebar from "render/layout/Sidebar";
import ChatSidebar from "chat/ChatSidebar";
import { AnimatePresence, motion } from "framer-motion";
import SettingsSidebarContent from "setting/SettingsSidebarContent";
import HomeSidebarContent from "app/pages/HomeSidebarContent";
import LifeSidebarContent from "life/LifeSidebarContent";

const MainLayout: React.FC = () => {
  const location = useLocation();
  const isSettingsPage = location.pathname.startsWith("/settings");
  const isLifePage = location.pathname.startsWith("/life");
  const isChatPage = location.pathname.startsWith("/chat");

  const getSidebarContent = () => {
    if (isSettingsPage) {
      return <SettingsSidebarContent />;
    }
    if (isLifePage) {
      return <LifeSidebarContent />;
    }
    if (isChatPage) {
      return <ChatSidebar />;
    }

    return <HomeSidebarContent />;
  };

  const isChatDetailPage =
    location.pathname.startsWith("/chat/") && location.pathname !== "/chat";

  const renderContent = () => {
    if (isChatDetailPage) {
      return <Outlet />;
    }

    return (
      <Suspense fallback={<div>loading</div>}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, visibility: "hidden" }}
            animate={{ opacity: 1, visibility: "visible" }}
            exit={{ opacity: 0, visibility: "hidden" }}
            transition={{ duration: 0.3, when: "beforeChildren" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </Suspense>
    );
  };

  return (
    <Sidebar sidebarContent={getSidebarContent()} fullWidth={isChatDetailPage}>
      {renderContent()}
    </Sidebar>
  );
};

export default MainLayout;
