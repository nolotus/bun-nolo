import React, { Suspense, lazy } from "react";
import { PageLoader } from "render/blocks/PageLoader";
import { Outlet, Link } from "react-router-dom";
import Sidebar from "render/layout/Sidebar";

const ChatPage = lazy(() => import("./ChatPage"));

const Layout = () => {
  const sidebarContent = (
    <nav>
      <ul style={{ listStyleType: "none", padding: 0 }}>
        <li style={{ marginBottom: "16px" }}>
          <Link
            to="/chat"
            style={{
              color: "#2563eb",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span>Chat</span>
          </Link>
        </li>
        {/* 可以在这里添加更多的导航链接 */}
      </ul>
    </nav>
  );

  return (
    <Sidebar sidebarContent={sidebarContent}>
      <Outlet />
    </Sidebar>
  );
};

export const routes = {
  path: "/",
  element: <Layout />,
  children: [
    {
      path: "chat",
      element: (
        <Suspense fallback={<PageLoader />}>
          <ChatPage />
        </Suspense>
      ),
    },
  ],
};
