// App.tsx
import React from "react";
import Layout from "ai/write/Layout";
import { routes, NotFound } from "ai/write/routes";

import ErrorBoundary from "./components/ErrorBoundary";
import PerformanceMonitor from "./components/PerformanceMonitor";
import { RouteProvider, useRoute } from "./RouteContext";

interface AppProps {
  initialPath: string;
}

function App({ initialPath }: AppProps) {
  return (
    <ErrorBoundary>
      {typeof window !== "undefined" && <PerformanceMonitor />}
      <RouteProvider initialPath={initialPath}>
        <Layout>
          <Router />
        </Layout>
      </RouteProvider>
    </ErrorBoundary>
  );
}

const Router: React.FC = () => {
  const { currentPath } = useRoute();
  const Route = routes[currentPath] || {
    title: "Not Found",
    component: NotFound,
  };
  const Component = Route.component;

  return (
    <ErrorBoundary fallback={<div>Error loading this component</div>}>
      <Component />
    </ErrorBoundary>
  );
};

export default App;
