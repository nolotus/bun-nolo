import { PaperAirplaneIcon } from "@primer/octicons-react";
import { useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";
import type React from "react";

interface SendButtonProps {
  onClick: () => void;
  disabled: boolean;
}

const SendButton: React.FC<SendButtonProps> = ({ onClick, disabled }) => {
  const theme = useAppSelector(selectTheme)
  return (
    <>
      <style>
        {`
          .send-button {
            padding: 0 20px;
            height: 40px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: ${theme.primary};
            color: #FFFFFF;
            border: 1px solid transparent;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s ease-out;
            outline: none;
            gap: 8px;
            position: relative;
            overflow: hidden;
          }

          .send-button:hover {
            background-color: ${theme.hover};
            border-color: ${theme.primaryLight}20;
          }

          .send-button:active {
            transform: translateY(1px);
          }

          .send-button:focus {
            box-shadow: 0 0 0 2px ${theme.focus};
          }

          .send-button:disabled {
            background-color: ${theme.textLight};
            cursor: not-allowed;
            transform: none;
          }

          .send-button span {
            position: relative;
            z-index: 1;
          }

          .send-button svg {
            position: relative;
            z-index: 1;
            transition: transform 0.2s ease-out;
          }

          .send-button:hover svg {
            transform: translateX(2px);
          }

          .send-button:disabled svg {
            transform: none;
          }
        `}
      </style>
      <button onClick={onClick} className="send-button" disabled={disabled}>
        <span>发送</span>
        <PaperAirplaneIcon size={14} />
      </button>
    </>
  );
};

export default SendButton;
