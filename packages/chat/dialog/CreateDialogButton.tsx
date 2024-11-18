// chat/dialog/CreateDialogButton.tsx

import React from "react";
import { CopyIcon } from "@primer/octicons-react";
import { Spinner } from "@primer/react";

import { useCreateDialog } from "./useCreateDialog";

const IconButton = ({ onClick, disabled, children }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const buttonStyle = {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "4px",
    color: "inherit",
    borderRadius: "4px",
    flexShrink: 0,
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

const CreateDialogButton = ({ dialogConfig }) => {
  const { isLoading, createNewDialog } = useCreateDialog();

  const handleCreateClick = () => {
    createNewDialog({
      cybots: dialogConfig.cybots,
    });
  };

  return (
    <IconButton onClick={handleCreateClick} disabled={isLoading}>
      {isLoading ? <Spinner size="small" /> : <CopyIcon size={16} />}
    </IconButton>
  );
};

export default CreateDialogButton;
