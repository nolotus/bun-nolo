// components/Layout.tsx
import React from "react";
import { useRoute } from "server/next/RouteContext";

const appContainerStyle = {
  maxWidth: "100%",
  height: "100vh",
  margin: "0 auto",
  padding: "0",
  overflow: "hidden",
  position: "relative" as "relative",
};

const navigationStyle = {
  marginBottom: "20px",
  padding: "20px",
  position: "relative" as "relative",
  zIndex: 10,
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

  const isWritingAiPage = currentPath === "/writing";

  return (
    <div style={appContainerStyle}>
      {!isWritingAiPage && (
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
            onMouseLeave={(e) =>
              (e.currentTarget.style.textDecoration = "none")
            }
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
            onMouseLeave={(e) =>
              (e.currentTarget.style.textDecoration = "none")
            }
          >
            Writing
          </a>
        </nav>
      )}
      {children}
    </div>
  );
};

export default Layout;
