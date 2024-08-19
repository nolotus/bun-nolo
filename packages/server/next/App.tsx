// App.tsx
import React from "react";
import Layout from "ai/write/Layout";
import ErrorBoundary from "./components/ErrorBoundary";
import PerformanceMonitor from "./components/PerformanceMonitor";
import { RouteProvider } from "./RouteContext";
import Router from "./Router";

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

export default App;
