import React from "react";
import { TrashIcon, PlusIcon, GearIcon } from "@primer/octicons-react";
import { useSelector } from "react-redux";

import { selectTotalDialogTokens } from "./dialogSlice";
import EditableTitle from "./EditableTitle";
import CybotNameChip from "./CybotNameChip";
import { useCreateDialog } from "./useCreateDialog";
import ToggleSidebarButton from "./ToggleSidebarButton";
import EditableCategory from "./EditableCategory";

const styles = {
  headerBar: {
    padding: "10px 16px",
    display: "flex",
    alignItems: "center",
    backgroundColor: "var(--surface1)",
  },
  contentContainer: {
    display: "flex",
    alignItems: "center",
    flexGrow: 1,
    gap: "12px",
    minWidth: 0,
  },
  cybotNamesContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px",
    minWidth: "80px",
    maxWidth: "200px",
  },
  titleContainer: {
    flexGrow: 1,
    minWidth: 0,
  },
  iconButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    color: "var(--text2)",
    borderRadius: "4px",
    flexShrink: 0,
  },
  tokenUsageContainer: {
    fontSize: "12px",
    color: "var(--text2)",
    marginLeft: "auto",
    padding: "4px 8px",
    backgroundColor: "var(--surface2)",
    borderRadius: "4px",
  },
  categoryContainer: {
    fontSize: "12px",
    color: "var(--text2)",
    marginRight: "8px",
  },
};

const IconButton = ({ onClick, disabled, children }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const buttonStyle = {
    ...styles.iconButton,
    backgroundColor: isHovered ? "var(--surface2)" : "transparent",
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

const DialogHeader = ({
  currentDialogConfig,
  toggleSidebar,
  isSidebarOpen,
  allowEdit,
  onDeleteClick,
  onSettingsClick,
}) => {
  const { isLoading: creatingDialog, createDialog } = useCreateDialog();
  const currentDialogTokens = useSelector(selectTotalDialogTokens);

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
              <PlusIcon size={14} />
            </IconButton>
            <IconButton onClick={onSettingsClick}>
              <GearIcon size={14} />
            </IconButton>
            <IconButton onClick={onDeleteClick}>
              <TrashIcon size={14} />
            </IconButton>
          </>
        )}
      </div>
    </div>
  );
};

export default React.memo(DialogHeader);
