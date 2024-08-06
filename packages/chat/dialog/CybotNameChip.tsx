import React from "react";
import styled from "styled-components";
import { useFetchData } from "app/hooks";
import { extractCustomId } from "core";
import { useModal, Dialog } from "render/ui";
import ChatConfigForm from "ai/blocks/ChatConfigForm";

const ChipContainer = styled.span`
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 12px;
  background-color: ${(props) => props.theme.surface2};
  color: ${(props) => props.theme.text2};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${(props) => props.theme.surface3};
  }
`;

interface CybotNameChipProps {
  cybotId: string;
  source: string;
}

const CybotNameChip: React.FC<CybotNameChipProps> = ({ cybotId, source }) => {
  const { isLoading, data: cybot } = useFetchData(cybotId, { source });
  const { visible: editVisible, open: openEdit, close: closeEdit } = useModal();

  if (isLoading) return null;

  const displayName = cybot?.name || extractCustomId(cybotId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openEdit();
  };

  return (
    <>
      <ChipContainer title={displayName} onClick={handleClick}>
        {displayName}
      </ChipContainer>
      {editVisible && cybot && (
        <Dialog
          isOpen={editVisible}
          onClose={closeEdit}
          title={`Edit ${cybot.name || "Cybot"}`}
        >
          <ChatConfigForm initialValues={cybot} onClose={closeEdit} />
        </Dialog>
      )}
    </>
  );
};

export default React.memo(CybotNameChip);
