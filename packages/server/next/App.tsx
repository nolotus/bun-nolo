import React from "react";
import styled from "styled-components";
import { routes, NotFound } from "./routes";

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
    <AppContainer>
      <Navigation>
        <NavLink href="/">Home</NavLink>
        <NavLink href="/writing">Writing</NavLink>
      </Navigation>
      <Component />
    </AppContainer>
  );
}

export default App;
