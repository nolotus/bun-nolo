import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { patchData, write } from "database/dbSlice";
import { useAppSelector, useQueryData } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";
import { DataType } from "create/types";
import { useAuth } from "auth/useAuth";

const CategoryContainer = styled.div<{ allowEdit: boolean }>`
  display: inline-block;
  font-size: 12px;
  color: ${(props) => props.theme.text2};
  cursor: ${(props) => (props.allowEdit ? "pointer" : "default")};
`;

const CategoryInput = styled.input`
  font-size: 12px;
  color: ${(props) => props.theme.text1};
  background-color: ${(props) => props.theme.surface2};
  border: 1px solid ${(props) => props.theme.border};
  border-radius: 4px;
  padding: 2px 4px;
`;

interface EditableCategoryProps {
  categoryId?: string;
  dialogId: string;
  allowEdit: boolean;
}

const EditableCategory: React.FC<EditableCategoryProps> = ({
  categoryId,
  dialogId,
  allowEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localCategoryName, setLocalCategoryName] = useState("");
  const dispatch = useDispatch();
  const currentUserId = useAppSelector(selectCurrentUserId);
  // 查询所有分类
  const auth = useAuth();

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

  const { data: categories } = useQueryData(categoryQueryConfig);
  useEffect(() => {
    if (categories && categoryId) {
      const category = categories.find((cat) => cat.id === categoryId);

      setLocalCategoryName(category ? category.name : "");
    } else {
      setLocalCategoryName("");
    }
  }, [categories, categoryId]);

  const handleClick = () => {
    if (allowEdit) {
      setIsEditing(true);
    }
  };

  const handleBlur = async () => {
    setIsEditing(false);
    if (
      localCategoryName &&
      (!categoryId ||
        localCategoryName !==
          categories?.find((cat) => cat.id === categoryId)?.name)
    ) {
      // 创建新分类
      const categoryConfig = {
        data: {
          type: DataType.Category,
          name: localCategoryName,
          parentId: null,
          isCollapsed: false,
          order: 0,
        },
        flags: { isJSON: true },
        userId: currentUserId,
      };

      try {
        const result = await dispatch(write(categoryConfig));
        if (result.payload && result.payload.id) {
          // 更新对话，关联新创建的分类
          await dispatch(
            patchData({
              id: dialogId,
              changes: { categoryId: result.payload.id },
            }),
          );
        }
      } catch (error) {
        console.error("Failed to create category or update dialog:", error);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    }
  };

  if (isEditing && allowEdit) {
    return (
      <CategoryInput
        value={localCategoryName}
        onChange={(e) => setLocalCategoryName(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
      />
    );
  }

  return (
    <CategoryContainer onClick={handleClick} allowEdit={allowEdit}>
      {localCategoryName || "No Category"}
    </CategoryContainer>
  );
};

export default EditableCategory;
