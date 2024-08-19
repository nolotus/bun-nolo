// components/Layout.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRoute } from "server/next/RouteContext";

const appContainerStyle = {
  maxWidth: "1200px", // 增加最大宽度
  margin: "0 auto",
  padding: "20px",
};

const navigationStyle = {
  marginBottom: "20px",
};

const navLinkStyle = {
  marginRight: "10px",
  textDecoration: "none",
  color: "#333",
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { currentPath, navigate } = useRoute();

  return (
    <div style={appContainerStyle}>
      <nav style={navigationStyle}>
        <a
          style={navLinkStyle}
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.textDecoration = "underline")
          }
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
        >
          Home
        </a>
        <a
          style={navLinkStyle}
          href="/writing"
          onClick={(e) => {
            e.preventDefault();
            navigate("/writing");
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.textDecoration = "underline")
          }
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
        >
          Writing
        </a>
      </nav>
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPath}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Layout;
