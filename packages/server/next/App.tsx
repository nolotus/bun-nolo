// App.tsx
import React, { useState, useEffect } from "react";
import { routes, NotFound } from "ai/write/routes";
import ErrorBoundary from "./components/ErrorBoundary";
import PerformanceMonitor from "./components/PerformanceMonitor";
import Layout from "ai/write/Layout";

interface AppProps {
  initialPath: string;
}

function App({ initialPath }: AppProps) {
  const [currentPath, setCurrentPath] = useState(initialPath);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const navigate = (path: string) => {
    window.history.pushState(null, "", path);
    setCurrentPath(path);
  };

  const Route = routes[currentPath] || {
    title: "Not Found",
    component: NotFound,
  };
  const Component = Route.component;

  return (
    <ErrorBoundary>
      {typeof window !== "undefined" && <PerformanceMonitor />}
      <Layout navigate={navigate}>
        <ErrorBoundary fallback={<div>Error loading this component</div>}>
          <Component />
        </ErrorBoundary>
      </Layout>
    </ErrorBoundary>
  );
}

export default App;
