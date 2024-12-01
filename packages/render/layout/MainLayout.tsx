// MainLayout.tsx
import React, { Suspense } from "react";
import { useLocation, Outlet } from "react-router-dom";
import Sidebar from "render/layout/Sidebar";
import ChatSidebar from "chat/ChatSidebar";
import { AnimatePresence, motion } from "framer-motion";
import HomeSidebarContent from "app/pages/HomeSidebarContent";
import LifeSidebarContent from "life/LifeSidebarContent";

const MainLayout: React.FC = () => {
  const location = useLocation();
  const isSettingsPage = location.pathname.startsWith("/setting");
  const isLifePage = location.pathname.startsWith("/life");

  const getSidebarContent = () => {
    if (location.pathname === "/") {
      return <HomeSidebarContent />;
    }
    if (isSettingsPage) {
      return null;
    }
    if (isLifePage) {
      return <LifeSidebarContent />;
    }

    return <ChatSidebar />;
  };

  const isChatDetailPage =
    location.pathname.startsWith("/chat/") && location.pathname !== "/chat";

  return (
    <Sidebar sidebarContent={getSidebarContent()} fullWidth={isChatDetailPage}>
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
    </Sidebar>
  );
};

export default MainLayout;
