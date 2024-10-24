// chat/dialog/CreateDialogButton.tsx
import React from "react";
import { CopyIcon } from "@primer/octicons-react";
import { Spinner } from "@primer/react"; // 引入 Spinner
import { useCreateDialog } from "./useCreateDialog";

const CreateDialogButton = ({ dialogConfig }) => {
  const { isLoading: creatingDialog, createDialog } = useCreateDialog();

  const handleCreateClick = () => {
    createDialog({
      cybots: dialogConfig.cybots,
    });
  };

  const styles = {
    iconButton: {
      background: "transparent",
      border: "none",
      cursor: "pointer",
      padding: "4px",
      color: "inherit",
      borderRadius: "4px",
      flexShrink: 0,
    },
  };

  const IconButton = ({ onClick, disabled, children }) => {
    const [isHovered, setIsHovered] = React.useState(false);

    const buttonStyle = {
      ...styles.iconButton,
      backgroundColor: isHovered ? "#f0f0f0" : "transparent",
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

  return (
    <IconButton onClick={handleCreateClick} disabled={creatingDialog}>
      {creatingDialog ? (
        <Spinner size="small" /> // 使用 Spinner 组件
      ) : (
        <CopyIcon size={16} />
      )}
    </IconButton>
  );
};

export default CreateDialogButton;
