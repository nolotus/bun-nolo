import React from "react";
import styled from "styled-components";
import Writing from "ai/writing";

const PageContainer = styled.div`
  padding: 20px;
  border-radius: 5px;
`;

const HomeContainer = styled(PageContainer)`
  background-color: #f0f0f0;
`;

const NotFoundContainer = styled(PageContainer)`
  background-color: #ffe6e6;
`;

export function Home() {
  return (
    <HomeContainer>
      <h1>Welcome Home</h1>
      <p>This is the home page of our application.</p>
    </HomeContainer>
  );
}

export function NotFound() {
  return (
    <NotFoundContainer>
      <h1>404 - Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
    </NotFoundContainer>
  );
}

export const routes = {
  "/": { title: "Home", component: Home },
  "/writing": { title: "Writing", component: Writing },
};
