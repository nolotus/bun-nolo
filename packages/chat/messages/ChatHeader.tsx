import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  TrashIcon,
} from "@primer/octicons-react";
import EditableTitle from "./EditableTitle";
import CybotNameChip from "./CybotNameChip";

const HeaderBar = styled.div`
  padding: 10px 16px;
  display: flex;
  align-items: center;
  background-color: ${(props) => props.theme.surface1};
`;

const ToggleSidebarButton = styled(motion.button)`
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

const ContentContainer = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  gap: 12px;
  min-width: 0;
`;

const CybotNamesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-width: 80px;
  max-width: 200px;
`;

const TitleContainer = styled.div`
  flex-grow: 1;
  min-width: 0;
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: ${(props) => props.theme.text2};
  border-radius: 4px;
  flex-shrink: 0;

  &:hover {
    background-color: ${(props) => props.theme.surface2};
  }
`;

interface ChatHeaderProps {
  currentDialogConfig: {
    id: string;
    title?: string;
    source: string;
    cybots: string[];
  };
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  allowEdit: boolean;
  onDeleteClick: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  currentDialogConfig,
  toggleSidebar,
  isSidebarOpen,
  allowEdit,
  onDeleteClick,
}) => {
  return (
    <HeaderBar>
      <ToggleSidebarButton
        onClick={toggleSidebar}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isSidebarOpen ? (
          <ChevronLeftIcon size={16} />
        ) : (
          <ChevronRightIcon size={16} />
        )}
      </ToggleSidebarButton>
      <ContentContainer>
        <CybotNamesContainer>
          {currentDialogConfig.cybots.map((cybotId) => (
            <CybotNameChip
              key={cybotId}
              cybotId={cybotId}
              source={currentDialogConfig.source}
            />
          ))}
        </CybotNamesContainer>
        <TitleContainer>
          <EditableTitle
            currentDialogConfig={currentDialogConfig}
            allowEdit={allowEdit}
          />
        </TitleContainer>
        {allowEdit && (
          <IconButton onClick={onDeleteClick}>
            <TrashIcon size={14} />
          </IconButton>
        )}
      </ContentContainer>
    </HeaderBar>
  );
};

export default React.memo(ChatHeader);
