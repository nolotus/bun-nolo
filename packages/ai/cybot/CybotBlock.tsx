import React from "react";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { Button } from "render/ui";
import { useSelector } from "react-redux";
import { selectTheme } from "app/theme/themeSlice";
import { styles, themeStyles } from "render/ui/styles";

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

  const combinedStyles = {
    cybotCard: {
      ...styles.flexColumn,
      ...styles.p3,
      ...themeStyles.surface1(theme),
      ...themeStyles.textColor1(theme),
      borderRadius: theme.borderRadius,
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      height: "100%",
      transition: "background-color 0.3s ease, color 0.3s ease",
    },
    cardHeader: {
      ...styles.flexBetween,
      ...styles.mb2,
    },
    title: {
      ...styles.textEllipsis,
      fontSize: theme.fontSize.medium,
      fontWeight: "bold",
      flexShrink: 0,
      maxWidth: "calc(100% - 100px)",
    },
    button: {
      backgroundColor: theme.accentColor,
      color: theme.surface1,
      fontWeight: "600",
      padding: "0.5rem 1rem",
      borderRadius: theme.borderRadius,
      transition: "background-color 0.2s ease, color 0.2s ease",
      minWidth: "80px",
    },
    infoContainer: {
      ...styles.flexGrow1,
      ...styles.flexColumn,
    },
    infoText: {
      color: theme.text2,
      ...styles.mb2,
      ...styles.flexStart,
    },
    label: {
      fontWeight: "600",
      minWidth: "70px",
      marginRight: "0.5rem",
      color: theme.text1,
    },
    modelName: {
      ...styles.textEllipsis,
    },
    introduction: {
      display: "-webkit-box",
      WebkitLineClamp: 3,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
    },
  };

  return (
    <div style={combinedStyles.cybotCard}>
      <div style={combinedStyles.cardHeader}>
        <div style={combinedStyles.title} title={item.name}>
          {item.name}
        </div>
        <Button
          style={combinedStyles.button}
          loading={isLoading}
          onClick={createNewDialog}
        >
          对话
        </Button>
      </div>
      <div style={combinedStyles.infoContainer}>
        <div style={combinedStyles.infoText}>
          <span style={combinedStyles.label}>模型名：</span>
          <span style={combinedStyles.modelName} title={item.model}>
            {item.model}
          </span>
        </div>
        <div style={combinedStyles.infoText}>
          <span style={combinedStyles.label}>介绍：</span>
          <span style={combinedStyles.introduction}>{item.introduction}</span>
        </div>
      </div>
    </div>
  );
};

export default CybotBlock;
