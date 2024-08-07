import React from "react";
import { useAuth } from "auth/useAuth";
import { useSearchParams } from "react-router-dom";
import { extractUserId } from "core/prefix";
import OpenProps from "open-props";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";
import { DataType } from "create/types";
import { useQueryData } from "app/hooks";

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

  // 查询分类数据
  const categoryQueryConfig = {
    queryUserId: auth.user?.userId,
    options: {
      isJSON: true,
      limit: 100, // 或者您想要的其他限制
      condition: {
        type: DataType.Category,
      },
    },
  };

  const { data: categories, isLoading: isCategoriesLoading } =
    useQueryData(categoryQueryConfig);
  const isCreator = (id) => {
    const dataUserId = extractUserId(id);
    return dataUserId === auth.user?.userId;
  };

  const categorizedDialogs = dialogList.reduce((acc, dialog) => {
    const categoryId = dialog.categoryId || "uncategorized";
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(dialog);
    return acc;
  }, {});

  if (isCategoriesLoading) {
    return <div>Loading categories...</div>;
  }

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: OpenProps.size2 }}
    >
      {Object.entries(categorizedDialogs).map(([categoryId, dialogs]) => {
        const category = categories.find((cat) => cat.id === categoryId) || {
          name: "未分类",
        };
        return (
          <GroupContainer key={categoryId}>
            <GroupHeader>
              <GroupTitle theme={theme}>{category.name}</GroupTitle>
            </GroupHeader>
            <DialogListContainer>
              {dialogs.map((dialog) => (
                <DialogItem
                  key={dialog.id}
                  id={dialog.id}
                  isSelected={currentDialogId === dialog.id}
                  isCreator={isCreator(dialog.id)}
                  source={source}
                  categoryId={categoryId}
                />
              ))}
            </DialogListContainer>
          </GroupContainer>
        );
      })}
    </div>
  );
};
