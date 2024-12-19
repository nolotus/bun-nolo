import { PaperAirplaneIcon } from "@primer/octicons-react";
import type React from "react";
import { BASE_COLORS } from "render/styles/colors";

interface SendButtonProps {
	onClick: () => void;
	disabled: boolean;
}

const SendButton: React.FC<SendButtonProps> = ({ onClick, disabled }) => {
	return (
		<>
			<style>
				{`
          .send-button {
            padding: 0 24px;
            height: 48px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: ${BASE_COLORS.primary};
            color: #FFFFFF;
            border: none;
            cursor: pointer;
            font-size: 15px;
            font-weight: 500;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            outline: none;
            gap: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .send-button:hover {
            background-color: ${BASE_COLORS.primaryLight} !important;
            transform: scale(1.02);
          }
          .send-button:active {
            transform: scale(0.98);
          }
          

          .send-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
        `}
			</style>
			<button onClick={onClick} className="send-button" disabled={disabled}>
				<span>发送</span>
				<PaperAirplaneIcon size={16} />
			</button>
		</>
	);
};

export default SendButton;
