// Router.tsx
import React, { useState, useEffect } from "react";
import { routes, NotFound } from "ai/write/routes";
import ErrorBoundary from "./components/ErrorBoundary";

interface RouterProps {
  initialPath: string;
  children: (props: {
    Component: React.ComponentType;
    navigate: (path: string) => void;
  }) => React.ReactNode;
}

function Router({ initialPath, children }: RouterProps) {
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
    <ErrorBoundary fallback={<div>Error loading this component</div>}>
      {children({ Component, navigate })}
    </ErrorBoundary>
  );
}

export default Router;
