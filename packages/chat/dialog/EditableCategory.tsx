import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { patchData, write } from "database/dbSlice";
import { useAppSelector } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";
import { DataType } from "create/types";
import { useAuth } from "auth/useAuth";
import { selectTheme } from "app/theme/themeSlice";
import { useQueryData } from "app/hooks/useQueryData";

const categoryContainerStyle = (allowEdit, theme) => ({
  display: "inline-block",
  fontSize: theme.fontSize.small,
  color: theme.text2,
  cursor: allowEdit ? "pointer" : "default",
});

const categoryInputStyle = (theme) => ({
  fontSize: theme.fontSize.small,
  color: theme.text1,
  backgroundColor: theme.surface2,
  borderRadius: theme.borderRadius,
  padding: `${theme.spacing.xsmall} ${theme.spacing.small}`,
});
//todo dialogId change to id
const EditableCategory = ({ categoryId, dialogId, allowEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localCategoryName, setLocalCategoryName] = useState("");
  const dispatch = useDispatch();
  const currentUserId = useAppSelector(selectCurrentUserId);
  const theme = useSelector(selectTheme);
  const auth = useAuth();

  const categoryQueryConfig = {
    queryUserId: auth.user?.userId,
    options: {
      isJSON: true,
      limit: 100,
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
          await dispatch(
            patchData({
              id: dialogId,
              changes: { categoryId: result.payload.id },
            })
          );
        }
      } catch (error) {
        console.error("Failed to create category or update dialog:", error);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleBlur();
    }
  };

  if (isEditing && allowEdit) {
    return (
      <input
        style={categoryInputStyle(theme)}
        value={localCategoryName}
        onChange={(e) => setLocalCategoryName(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
      />
    );
  }

  return (
    <div onClick={handleClick} style={categoryContainerStyle(allowEdit, theme)}>
      {localCategoryName || "No Category"}
    </div>
  );
};

export default EditableCategory;
