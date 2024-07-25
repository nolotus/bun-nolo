import React from "react";
import styled from "styled-components";
import { useFetchData } from "app/hooks";
import { extractCustomId } from "core";
import { Spinner } from "@primer/react";

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
  onEdit: (cybotId: string) => void;
}

const CybotNameChip: React.FC<CybotNameChipProps> = ({
  cybotId,
  source,
  onEdit,
}) => {
  const { isLoading, data: llm } = useFetchData(cybotId, { source });

  if (isLoading) return <Spinner size="small" />;

  const displayName = llm?.name || extractCustomId(cybotId);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(cybotId);
  };

  return (
    <ChipContainer title={displayName} onClick={handleClick}>
      {displayName}
    </ChipContainer>
  );
};

export default React.memo(CybotNameChip);
