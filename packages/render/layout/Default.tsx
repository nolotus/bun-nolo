// Layout.tsx
import { AnimatePresence, motion } from "framer-motion";
import React, { Suspense } from "react";
import { Outlet, useLocation, Link } from "react-router-dom";
import { HomeIcon, SignInIcon } from "@primer/octicons-react";
import Sidebar from "render/layout/Sidebar";

const Layout: React.FC<{ disableAnimation?: boolean }> = ({
  disableAnimation = false,
}) => {
  const location = useLocation();

  const renderContent = () => {
    if (disableAnimation) {
      return <Outlet />;
    }

    return (
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
    );
  };

  const sidebarContent = (
    <ul style={{ listStyleType: "none", padding: 0 }}>
      <li style={{ marginBottom: "16px" }}>
        <Link
          to="/"
          style={{
            color: "#2563eb",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
          }}
        >
          <HomeIcon size={24} style={{ marginRight: "8px" }} />
          <span>Home</span>
        </Link>
      </li>

      <li style={{ marginBottom: "16px" }}>
        <Link
          to="/contact"
          style={{
            color: "#2563eb",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
          }}
        >
          <SignInIcon size={24} style={{ marginRight: "8px" }} />
          <span>Contact</span>
        </Link>
      </li>
    </ul>
  );

  return (
    <Sidebar sidebarContent={sidebarContent}>
      <Suspense fallback={<div>loading</div>}>{renderContent()}</Suspense>
    </Sidebar>
  );
};

export default Layout;
