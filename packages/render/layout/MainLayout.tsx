// MainLayout.tsx
import React, { Suspense } from "react";
import { useLocation, Outlet } from "react-router-dom";
import Sidebar from "render/layout/Sidebar";
import ChatSidebar from "chat/ChatSidebar";
import { AnimatePresence, motion } from "framer-motion";
import HomeSidebarContent from "app/pages/HomeSidebarContent";
import LifeSidebarContent from "life/LifeSidebarContent";
import { useAuth } from "auth/useAuth";

const MainLayout: React.FC = () => {
  const location = useLocation();
  const { isLoggedIn, user } = useAuth();

  const getSidebarContent = () => {
    let currentSidebar = isLoggedIn ? <ChatSidebar /> : null;
    const lastValidSidebarRef = React.useRef<React.ReactNode>(null);

    // 明确的路由规则判断
    if (location.pathname === "/") {
      currentSidebar = <HomeSidebarContent />;
    } else if (location.pathname.startsWith("/life")) {
      currentSidebar = <LifeSidebarContent />;
    } else if (location.pathname.startsWith("/chat")) {
      currentSidebar = <ChatSidebar />;
    }

    // 如果当前有明确的 sidebar,更新 ref
    if (currentSidebar) {
      lastValidSidebarRef.current = currentSidebar;
      return currentSidebar;
    }

    // 否则返回上一个有效的 sidebar
    return lastValidSidebarRef.current;
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
