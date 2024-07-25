import React from "react";
import { useFetchData } from "app/hooks";
import { Spinner } from "@primer/react";
import { DialogItem } from "./DialogItem";
import { extractCustomId } from "core";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";

const GroupContainer = styled.div`
  margin-bottom: 24px; // 调整组间距
`;

const GroupHeader = styled.div`
  padding: 0 16px 8px; // 只保留底部和水平方向的内边距
`;

const GroupTitle = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.text1};
  font-size: 14px;
`;

const DialogList = styled.div`
  // 移除内边距，让 DialogItem 自己控制间距
`;

export const DialogGroup = ({ cybotId, dialogs, currentDialogId, source }) => {
  const theme = useSelector(selectTheme);
  const { isLoading, data: llm } = useFetchData(cybotId, { source });

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <GroupContainer>
      <GroupHeader>
        <GroupTitle theme={theme}>
          {llm?.name ? llm.name : extractCustomId(cybotId)}
        </GroupTitle>
      </GroupHeader>
      <DialogList>
        {dialogs.map((dialog) => (
          <DialogItem
            key={dialog.id}
            id={dialog.id}
            isSelected={currentDialogId === dialog.id}
            source={source}
          />
        ))}
      </DialogList>
    </GroupContainer>
  );
};
