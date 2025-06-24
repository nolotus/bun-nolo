import { useAuth } from "auth/hooks/useAuth";
import ChatSidebar from "chat/ChatSidebar";
import LifeSidebarContent from "life/LifeSidebarContent";
import React, { Suspense, useMemo } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "render/layout/Sidebar";

const MainLayout: React.FC = () => {
  const location = useLocation();
  const { isLoggedIn } = useAuth();

  const sidebarContent = useMemo(() => {
    if (location.pathname.startsWith("/life")) {
      return <LifeSidebarContent />;
    }

    if (isLoggedIn) {
      return <ChatSidebar />;
    }

    return null;
  }, [location.pathname, isLoggedIn]);

  return (
    <Sidebar sidebarContent={sidebarContent}>
      <Suspense fallback={<div>main Loading...</div>}>
        <Outlet />
      </Suspense>
    </Sidebar>
  );
};

export default MainLayout;
