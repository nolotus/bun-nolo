// chat/dialog/DialogHeader.tsx

import React from "react";
import { TrashIcon, PlusIcon, GearIcon } from "@primer/octicons-react";
import { useSelector } from "react-redux";

import { selectTotalDialogTokens } from "./dialogSlice";
import { selectTheme } from "app/theme/themeSlice";
import EditableTitle from "./EditableTitle";
import CybotNameChip from "./CybotNameChip";
import { useCreateDialog } from "./useCreateDialog";
import ToggleSidebarButton from "./ToggleSidebarButton";
import EditableCategory from "./EditableCategory";

const DialogHeader = ({
  currentDialogConfig,
  toggleSidebar,
  isSidebarOpen,
  allowEdit,
  onDeleteClick,
  onSettingsClick,
}) => {
  const theme = useSelector(selectTheme);
  const { isLoading: creatingDialog, createDialog } = useCreateDialog();
  const currentDialogTokens = useSelector(selectTotalDialogTokens);

  const styles = {
    headerBar: {
      padding: theme.dialogHeader.padding,
      display: "flex",
      alignItems: "center",
      backgroundColor: theme.surface1,
    },
    contentContainer: {
      display: "flex",
      alignItems: "center",
      flexGrow: 1,
      gap: theme.dialogHeader.gap,
      minWidth: 0,
    },
    cybotNamesContainer: {
      display: "flex",
      flexWrap: "wrap",
      gap: theme.spacing.xsmall,
      minWidth: theme.dialogHeader.cybotNamesContainer.minWidth,
      maxWidth: theme.dialogHeader.cybotNamesContainer.maxWidth,
    },
    titleContainer: {
      flexGrow: 1,
      minWidth: 0,
    },
    iconButton: {
      background: "transparent",
      border: "none",
      cursor: "pointer",
      padding: theme.spacing.xsmall,
      color: theme.text2,
      borderRadius: theme.borderRadius,
      flexShrink: 0,
    },
    tokenUsageContainer: {
      fontSize: theme.fontSize.small,
      color: theme.text2,
      marginLeft: "auto",
      padding: `${theme.spacing.xsmall} ${theme.spacing.small}`,
      backgroundColor: theme.surface2,
      borderRadius: theme.borderRadius,
    },
    categoryContainer: {
      fontSize: theme.fontSize.small,
      color: theme.text2,
      marginRight: theme.spacing.small,
    },
  };

  const IconButton = ({ onClick, disabled, children }) => {
    const [isHovered, setIsHovered] = React.useState(false);

    const buttonStyle = {
      ...styles.iconButton,
      backgroundColor: isHovered ? theme.surface2 : "transparent",
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled}
        style={buttonStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {children}
      </button>
    );
  };

  const handleCreateClick = () => {
    createDialog({
      cybots: currentDialogConfig.cybots,
      category: currentDialogConfig.category,
    });
  };

  return (
    <div style={styles.headerBar}>
      <ToggleSidebarButton onClick={toggleSidebar} isOpen={isSidebarOpen} />
      <div style={styles.contentContainer}>
        <div style={styles.cybotNamesContainer}>
          {currentDialogConfig.cybots?.map((cybotId) => (
            <CybotNameChip
              key={cybotId}
              cybotId={cybotId}
              source={currentDialogConfig.source}
            />
          ))}
        </div>
        <div style={styles.titleContainer}>
          <EditableTitle
            currentDialogConfig={currentDialogConfig}
            allowEdit={allowEdit}
          />
        </div>
        <div style={styles.categoryContainer}>
          <EditableCategory
            categoryId={currentDialogConfig.categoryId}
            dialogId={currentDialogConfig.id}
            allowEdit={allowEdit}
          />
        </div>
        <div style={styles.tokenUsageContainer}>
          Tokens: {currentDialogTokens}
        </div>
        {allowEdit && (
          <>
            <IconButton onClick={handleCreateClick} disabled={creatingDialog}>
              <PlusIcon size={theme.iconSize.small} />
            </IconButton>
            <IconButton onClick={onSettingsClick}>
              <GearIcon size={theme.iconSize.small} />
            </IconButton>
            <IconButton onClick={onDeleteClick}>
              <TrashIcon size={theme.iconSize.small} />
            </IconButton>
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(DialogHeader);
