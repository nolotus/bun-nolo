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
`;

interface CybotNameChipProps {
  cybotId: string;
  source: string;
}

const CybotNameChip: React.FC<CybotNameChipProps> = ({ cybotId, source }) => {
  const { isLoading, data: llm } = useFetchData(cybotId, { source });

  if (isLoading) return <Spinner size="small" />;

  const displayName = llm?.name || extractCustomId(cybotId);

  return <ChipContainer title={displayName}>{displayName}</ChipContainer>;
};

export default React.memo(CybotNameChip);
