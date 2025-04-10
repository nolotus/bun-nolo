import { TbMessageCirclePlus } from "react-icons/tb";
import { useCreateDialog } from "./useCreateDialog";
import { Tooltip } from "render/web/ui/Tooltip";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation("chat");
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
      <Tooltip content={t("newchat")} placement="bottom">
        <button
          onClick={handleCreateClick}
          disabled={isLoading}
          className="icon-button"
        >
          {isLoading ? <Spinner /> : <TbMessageCirclePlus size={16} />}
        </button>
      </Tooltip>
    </>
  );
};

export default CreateDialogButton;
