import styled from "styled-components";
import React from "react";

const PageContainer = styled.div`
  padding: 20px;
  border-radius: 5px;
`;
const NotFoundContainer = styled(PageContainer)`
  background-color: #ffe6e6;
`;
function NotFound() {
  return (
    <NotFoundContainer>
      <h1>404 - Not Found</h1>
      <p>Sorry, the page you are looking for does not exist.</p>
    </NotFoundContainer>
  );
}
export default NotFound;
