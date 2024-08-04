import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useDispatch } from "react-redux";
import { patchData } from "database/dbSlice";

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
  category?: string;
  dialogId: string;
  allowEdit: boolean;
}

const EditableCategory: React.FC<EditableCategoryProps> = ({
  category,
  dialogId,
  allowEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localCategory, setLocalCategory] = useState(category || "");
  const dispatch = useDispatch();

  useEffect(() => {
    setLocalCategory(category || "");
  }, [category]);

  const handleClick = () => {
    if (allowEdit) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (localCategory !== category) {
      dispatch(
        patchData({
          id: dialogId,
          changes: { category: localCategory },
        }),
      );
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
        value={localCategory}
        onChange={(e) => setLocalCategory(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
      />
    );
  }

  return (
    <CategoryContainer onClick={handleClick} allowEdit={allowEdit}>
      {localCategory || "No Category"}
    </CategoryContainer>
  );
};

export default EditableCategory;
