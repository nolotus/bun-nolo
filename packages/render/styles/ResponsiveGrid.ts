// ResponsiveGrid.tsx
import styled from "styled-components";

interface ResponsiveContainerProps {
  gap?: string;
  padding?: string;
}

interface ResponsiveItemProps {
  gap?: string;
}

export const ResponsiveContainer = styled.div<ResponsiveContainerProps>`
  display: flex;
  flex-wrap: wrap;
  gap: ${(props) => props.gap || "1.5rem"};
  background-color: ${(props) => props.theme.backgroundColor};
  transition: background-color 0.3s ease;
`;

export const ResponsiveItem = styled.div<ResponsiveItemProps>`
  flex: 0 0 100%;
  max-width: 100%;

  @media (min-width: 640px) {
    flex: 0 0 calc(50% - ${(props) => props.gap || "0.75rem"});
    max-width: calc(50% - ${(props) => props.gap || "0.75rem"});
  }

  @media (min-width: 1024px) {
    flex: 0 0 calc(33.333% - ${(props) => props.gap || "1rem"});
    max-width: calc(33.333% - ${(props) => props.gap || "1rem"});
  }

  @media (min-width: 1280px) {
    flex: 0 0 calc(25% - ${(props) => props.gap || "1.125rem"});
    max-width: calc(25% - ${(props) => props.gap || "1.125rem"});
  }
`;
