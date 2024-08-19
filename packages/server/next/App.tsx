// App.tsx
import React from "react";
import { routes, NotFound } from "ai/write/routes";
import ErrorBoundary from "./components/ErrorBoundary";
import PerformanceMonitor from "./components/PerformanceMonitor";

const appContainerStyle = {
  maxWidth: "800px",
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

interface AppProps {
  initialPath: string;
}

function App({ initialPath }: AppProps) {
  const Route = routes[initialPath] || {
    title: "Not Found",
    component: NotFound,
  };
  const Component = Route.component;

  return (
    <ErrorBoundary>
      {typeof window !== "undefined" && <PerformanceMonitor />}
      <div style={appContainerStyle}>
        <nav style={navigationStyle}>
          <a
            style={navLinkStyle}
            href="/"
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
        <ErrorBoundary fallback={<div>Error loading this component</div>}>
          <Component />
        </ErrorBoundary>
      </div>
    </ErrorBoundary>
  );
}

export default App;
