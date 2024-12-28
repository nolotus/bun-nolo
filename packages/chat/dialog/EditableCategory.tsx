import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { patchData, write } from "database/dbSlice";
import { useAppSelector } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";
import { DataType } from "create/types";
import { useAuth } from "auth/useAuth";
import { useQueryData } from "app/hooks/useQueryData";

const categoryContainerStyle = (allowEdit) => ({
  display: "inline-block",
  fontSize: "12px", // 硬编码字体大小
  color: "#666", // 硬编码文本颜色
  cursor: allowEdit ? "pointer" : "default",
});

const categoryInputStyle = {
  fontSize: "12px", // 硬编码字体大小
  color: "#333", // 硬编码文本颜色
  backgroundColor: "#f0f0f0", // 硬编码背景颜色
  borderRadius: "4px", // 硬编码边框半径
  padding: "4px 8px", // 硬编码内边距
};

const EditableCategory = ({ categoryId, dialogId, allowEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localCategoryName, setLocalCategoryName] = useState("");
  const dispatch = useDispatch();
  const currentUserId = useAppSelector(selectCurrentUserId);
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
        style={categoryInputStyle}
        value={localCategoryName}
        onChange={(e) => setLocalCategoryName(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoFocus
      />
    );
  }

  return (
    <div onClick={handleClick} style={categoryContainerStyle(allowEdit)}>
      {localCategoryName || "No Category"}
    </div>
  );
};

export default EditableCategory;
