// DialogHeader.tsx
import React from "react";
import styled from "styled-components";
import { TrashIcon, PlusIcon, GearIcon } from "@primer/octicons-react";
import { useSelector } from "react-redux";

import { selectTotalDialogTokens } from "./dialogSlice";
import EditableTitle from "./EditableTitle";
import CybotNameChip from "./CybotNameChip";
import { useCreateDialog } from "./useCreateDialog";
import ToggleSidebarButton from "./ToggleSidebarButton";
import EditableCategory from "./EditableCategory";

const HeaderBar = styled.div`
  padding: 10px 16px;
  display: flex;
  align-items: center;
  background-color: ${(props) => props.theme.surface1};
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

const TokenUsageContainer = styled.div`
  font-size: 12px;
  color: ${(props) => props.theme.text2};
  margin-left: auto;
  padding: 4px 8px;
  background-color: ${(props) => props.theme.surface2};
  border-radius: 4px;
`;

const CategoryContainer = styled.div`
  font-size: 12px;
  color: ${(props) => props.theme.text2};
  margin-right: 8px;
`;

interface DialogHeaderProps {
  currentDialogConfig: {
    id: string;
    title?: string;
    source: string;
    cybots: string[];
    category?: string;
  };
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  allowEdit: boolean;
  onDeleteClick: () => void;
  onSettingsClick: () => void;
}

const DialogHeader: React.FC<DialogHeaderProps> = ({
  currentDialogConfig,
  toggleSidebar,
  isSidebarOpen,
  allowEdit,
  onDeleteClick,
  onSettingsClick,
}) => {
  const { isLoading: creatingDialog, createDialog } = useCreateDialog();
  const currentDialogTokens = useSelector(selectTotalDialogTokens);

  const handleCreateClick = () => {
    createDialog({
      cybots: currentDialogConfig.cybots,
      category: currentDialogConfig.category,
    });
  };

  return (
    <HeaderBar>
      <ToggleSidebarButton onClick={toggleSidebar} isOpen={isSidebarOpen} />
      <ContentContainer>
        <CybotNamesContainer>
          {currentDialogConfig.cybots?.map((cybotId) => (
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
        <CategoryContainer>
          <EditableCategory
            categoryId={currentDialogConfig.categoryId}
            dialogId={currentDialogConfig.id}
            allowEdit={allowEdit}
          />
        </CategoryContainer>
        <TokenUsageContainer>Tokens: {currentDialogTokens}</TokenUsageContainer>
        {allowEdit && (
          <>
            <IconButton onClick={handleCreateClick} disabled={creatingDialog}>
              <PlusIcon size={14} />
            </IconButton>
            <IconButton onClick={onSettingsClick}>
              <GearIcon size={14} />
            </IconButton>
            <IconButton onClick={onDeleteClick}>
              <TrashIcon size={14} />
            </IconButton>
          </>
        )}
      </ContentContainer>
    </HeaderBar>
  );
};

export default React.memo(DialogHeader);
