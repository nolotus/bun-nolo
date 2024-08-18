// App.tsx
import React from "react";
import styled from "styled-components";
import { routes, NotFound } from "./routes";
import ErrorBoundary from "./components/ErrorBoundary";
import PerformanceMonitor from "./components/PerformanceMonitor";

const AppContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Navigation = styled.nav`
  margin-bottom: 20px;
`;

const NavLink = styled.a`
  margin-right: 10px;
  text-decoration: none;
  color: #333;
  &:hover {
    text-decoration: underline;
  }
`;

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
      {/* PerformanceMonitor 只在客户端渲染，服务器端会忽略它 */}
      {typeof window !== "undefined" && <PerformanceMonitor />}
      <AppContainer>
        <Navigation>
          <NavLink href="/">Home</NavLink>
          <NavLink href="/writing">Writing</NavLink>
        </Navigation>
        <ErrorBoundary fallback={<div>Error loading this component</div>}>
          {/* Component 是通过 routes 对象动态决定的 */}
          <Component />
        </ErrorBoundary>
      </AppContainer>
    </ErrorBoundary>
  );
}

export default App;
