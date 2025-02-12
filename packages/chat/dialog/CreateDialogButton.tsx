import React from "react";
import { TbMessageCirclePlus } from "react-icons/tb";
import { useCreateDialog } from "./useCreateDialog";

const IconButton = ({ onClick, disabled, children }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="icon-button"
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
    <>
      <style>
        {`
          .icon-button {
            background: transparent;
            border: none;
            cursor: pointer;
            padding: 4px;
            color: inherit;
            border-radius: 4px;
            flex-shrink: 0;
          }
          .icon-button:hover {
            background-color: #f0f0f0;
          }
        `}
      </style>
      <IconButton onClick={handleCreateClick} disabled={isLoading}>
        {isLoading ? <Spinner /> : <TbMessageCirclePlus size={16} />}
      </IconButton>
    </>
  );
};

export default CreateDialogButton;
