import HomeSidebarContent from "app/pages/HomeSidebarContent";
import { useAuth } from "auth/useAuth";
import ChatSidebar from "chat/ChatSidebar";
import LifeSidebarContent from "life/LifeSidebarContent";
import React, { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "render/layout/Sidebar";

const MainLayout: React.FC = () => {
  const location = useLocation();
  const { isLoggedIn } = useAuth();

  const getSidebarContent = () => {
    let currentSidebar = isLoggedIn ? <ChatSidebar /> : null;
    const lastValidSidebarRef = React.useRef<React.ReactNode>(null);

    if (location.pathname === "/") {
      currentSidebar = <HomeSidebarContent />;
    } else if (location.pathname.startsWith("/life")) {
      currentSidebar = <LifeSidebarContent />;
    } else if (location.pathname.startsWith("/create")) {
      currentSidebar = <ChatSidebar />;
    }

    if (currentSidebar) {
      lastValidSidebarRef.current = currentSidebar;
      return currentSidebar;
    }

    return lastValidSidebarRef.current;
  };

  return (
    <Sidebar sidebarContent={getSidebarContent()}>
      <Suspense fallback={<div>Loading...</div>}>
        <Outlet />
      </Suspense>
    </Sidebar>
  );
};

export default MainLayout;
