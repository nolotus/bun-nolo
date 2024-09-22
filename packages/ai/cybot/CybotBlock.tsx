// CybotBlock.tsx
import React from "react";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { Button } from "render/ui";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";

const CybotBlock = ({ item }) => {
  const { isLoading, createDialog } = useCreateDialog();
  const theme = useSelector(selectTheme);

  const createNewDialog = async () => {
    try {
      const cybotId = item.id;
      await createDialog({ cybots: [cybotId] });
    } catch (error) {
      // 错误处理
    }
  };

  const styles = {
    cybotCard: {
      backgroundColor: theme.surface1,
      color: theme.text1,
      borderRadius: "0.75rem",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      padding: "1.5rem",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      transition: "background-color 0.3s ease, color 0.3s ease",
    },
    cardHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "1rem",
    },
    title: {
      fontSize: "1.25rem",
      fontWeight: "bold",
      color: theme.text1,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    button: {
      backgroundColor: theme.accentColor,
      color: theme.surface1,
      fontWeight: "600",
      padding: "0.5rem 1rem",
      borderRadius: "0.375rem",
      transition: "background-color 0.2s ease, color 0.2s ease",
    },
    infoContainer: {
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
    },
    infoText: {
      color: theme.text2,
      marginBottom: "0.75rem",
      display: "flex",
      alignItems: "flex-start",
    },
    label: {
      fontWeight: "600",
      minWidth: "70px",
      marginRight: "0.5rem",
      color: theme.text1,
    },
    modelName: {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    introduction: {
      display: "-webkit-box",
      WebkitLineClamp: 3,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
    },
  };

  return (
    <div style={styles.cybotCard}>
      <div style={styles.cardHeader}>
        <div style={styles.title} title={item.name}>
          {item.name}
        </div>
        <Button
          style={styles.button}
          loading={isLoading}
          onClick={createNewDialog}
        >
          对话
        </Button>
      </div>
      <div style={styles.infoContainer}>
        <div style={styles.infoText}>
          <span style={styles.label}>模型名：</span>
          <span style={styles.modelName} title={item.model}>
            {item.model}
          </span>
        </div>
        <div style={styles.infoText}>
          <span style={styles.label}>介绍：</span>
          <span style={styles.introduction}>{item.introduction}</span>
        </div>
      </div>
    </div>
  );
};

export default CybotBlock;
