// ToggleSidebarButton.tsx
import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "@primer/octicons-react";

const StyledButton = styled(motion.button)`
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background-color: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-right: 12px;
  padding: 0;
  transition: all 0.2s ease-in-out;
  outline: none;

  &:hover {
    background-color: ${(props) => props.theme.surface2};
  }

  &:active {
    background-color: ${(props) => props.theme.surface3};
  }

  &:focus {
    box-shadow: 0 0 0 2px ${(props) => props.theme.link};
  }

  svg {
    color: ${(props) => props.theme.text2};
  }
`;

interface ToggleSidebarButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

const ToggleSidebarButton: React.FC<ToggleSidebarButtonProps> = ({
  onClick,
  isOpen,
}) => {
  return (
    <StyledButton
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {isOpen ? <ChevronLeftIcon size={16} /> : <ChevronRightIcon size={16} />}
    </StyledButton>
  );
};

export default ToggleSidebarButton;
