import React from "react";
import { useFetchData } from "app/hooks";
import IconButton from "render/ui/IconButton";
import { PencilIcon } from "@primer/octicons-react";
import { useModal, Dialog } from "render/ui";
import ChatConfigForm from "ai/blocks/ChatConfigForm";
import { Spinner } from "@primer/react";
import { useCouldEdit } from "auth/useCouldEdit";
import { DialogItem } from "./DialogItem";
import { extractCustomId } from "core";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";

const GroupContainer = styled.div`
  margin-bottom: 20px;
`;

const GroupHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 8px 12px;
  background-color: ${(props) => props.theme.surface2};
  border-radius: 6px;
`;

const GroupTitle = styled.div`
  font-weight: 600;
  color: ${(props) => props.theme.text1};
  font-size: 14px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const StyledIconButton = styled(IconButton)`
  color: ${(props) => props.theme.text1};
  background: transparent;
  border: none;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    background-color: ${(props) => props.theme.surface3};
  }
`;

export const DialogGroup = ({ cybotId, dialogs, currentDialogId, source }) => {
  const theme = useSelector(selectTheme);
  const { isLoading, data: llm } = useFetchData(cybotId, { source });
  const { visible: editVisible, open, close: closeEdit } = useModal();
  const allowEdit = useCouldEdit(cybotId);

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <GroupContainer>
      <GroupHeader>
        <GroupTitle>
          {llm?.name ? llm.name : extractCustomId(cybotId)}
        </GroupTitle>
        {allowEdit && (
          <ButtonGroup>
            <StyledIconButton
              icon={PencilIcon}
              onClick={(e) => {
                e.stopPropagation();
                open();
              }}
            />
          </ButtonGroup>
        )}
      </GroupHeader>
      {dialogs.map((dialog) => (
        <DialogItem
          key={dialog.id}
          id={dialog.id}
          isSelected={currentDialogId === dialog.id}
          source={source}
        />
      ))}
      {editVisible && (
        <Dialog
          isOpen={editVisible}
          onClose={closeEdit}
          title={`Edit ${llm.name}`}
        >
          <ChatConfigForm initialValues={llm} onClose={closeEdit} />
        </Dialog>
      )}
    </GroupContainer>
  );
};
