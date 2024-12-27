import React from "react";
import { CopyIcon } from "@primer/octicons-react";

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

const Spinner = () => {
  const spinnerStyle = {
    display: "inline-block",
    width: "16px",
    height: "16px",
    border: "2px solid #ccc",
    borderTop: "2px solid #333",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
      <div style={spinnerStyle} />
    </>
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
      {isLoading ? <Spinner /> : <CopyIcon size={16} />}
    </IconButton>
  );
};

export default CreateDialogButton;
