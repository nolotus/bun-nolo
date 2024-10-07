import React, { useEffect, useState } from "react";
import { useAuth } from "auth/useAuth";
import { extractUserId } from "core/prefix";
import OpenProps from "open-props";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";
import { DataType } from "create/types";
import { useQueryData } from "app/hooks";

import { DialogItem } from "./DialogItem";

export const DialogList = ({ dialogList, source }) => {
  const auth = useAuth();
  const theme = useSelector(selectTheme);
  const [selectedDialogId, setSelectedDialogId] = useState(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setSelectedDialogId(searchParams.get("dialogId"));

    const handlePopState = () => {
      const searchParams = new URLSearchParams(window.location.search);
      setSelectedDialogId(searchParams.get("dialogId"));
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // 查询分类数据
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

  const { data: categories = [], isLoading: isCategoriesLoading } =
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

  const handleDialogSelect = (dialogId) => {
    setSelectedDialogId(dialogId);
    window.history.pushState({}, "", `/chat/${dialogId}`);
  };

  if (isCategoriesLoading) {
    return <div>Loading categories...</div>;
  }

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      gap: OpenProps.size2,
    },
    groupContainer: {
      marginBottom: "24px",
    },
    groupHeader: {
      padding: "0 16px 8px",
    },
    groupTitle: {
      fontWeight: 600,
      color: theme.text1,
      fontSize: "14px",
    },
    dialogListContainer: {},
  };

  return (
    <div style={styles.container}>
      {Object.entries(categorizedDialogs).map(([categoryId, dialogs]) => {
        const category = categories.find((cat) => cat.id === categoryId) || {
          name: "未分类",
        };
        return (
          <div key={categoryId} style={styles.groupContainer}>
            <div style={styles.groupHeader}>
              <div style={styles.groupTitle}>{category.name}</div>
            </div>
            <div style={styles.dialogListContainer}>
              {dialogs.map((dialog) => (
                <DialogItem
                  key={dialog.id}
                  id={dialog.id}
                  isSelected={selectedDialogId === dialog.id}
                  isCreator={isCreator(dialog.id)}
                  source={source}
                  categoryId={categoryId}
                  onSelect={handleDialogSelect}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
