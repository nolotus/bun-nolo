// DialogList.jsx
import React from "react";
import { useAuth } from "auth/useAuth";
import { useSearchParams } from "react-router-dom";
import { extractUserId } from "core/prefix";
import OpenProps from "open-props";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";
import { DialogItem } from "./DialogItem";

const GroupContainer = styled.div`
  margin-bottom: 24px;
`;

const GroupHeader = styled.div`
  padding: 0 16px 8px;
`;

const GroupTitle = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.text1};
  font-size: 14px;
`;

const DialogListContainer = styled.div``;

export const DialogList = ({ dialogList, source }) => {
  const [searchParams] = useSearchParams();
  const auth = useAuth();
  const theme = useSelector(selectTheme);

  const currentDialogId = searchParams.get("dialogId");

  const isCreator = (id) => {
    const dataUserId = extractUserId(id);
    return dataUserId === auth.user?.userId;
  };

  const categorizedDialogs = dialogList.reduce((acc, dialog) => {
    const category = dialog.category || "未分类";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(dialog);
    return acc;
  }, {});

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: OpenProps.size2 }}
    >
      {Object.entries(categorizedDialogs).map(([category, dialogs]) => (
        <GroupContainer key={category}>
          <GroupHeader>
            <GroupTitle theme={theme}>{category}</GroupTitle>
          </GroupHeader>
          <DialogListContainer>
            {dialogs.map((dialog) => (
              <DialogItem
                key={dialog.id}
                id={dialog.id}
                isSelected={currentDialogId === dialog.id}
                isCreator={isCreator(dialog.id)}
                source={source}
              />
            ))}
          </DialogListContainer>
        </GroupContainer>
      ))}
    </div>
  );
};
