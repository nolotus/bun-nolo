import { XIcon } from "@primer/octicons-react";
import type React from "react";
import { defaultTheme } from "render/styles/colors";
import { Modal } from "./Modal";

interface DialogProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
	className?: string;
}

export const Dialog: React.FC<DialogProps> = ({
	isOpen,
	onClose,
	title,
	children,
	className = "",
}) => {
	return (
		<Modal isOpen={isOpen} onClose={onClose} size="medium" animation="slide">
			<style>
				{`
          .dialog-container {
            display: flex;
            flex-direction: column;
            background: ${defaultTheme.background};
            height: auto;
            max-height: 90vh;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 24px ${defaultTheme.shadowMedium};
          }

          .dialog-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 20px 24px;
            border-bottom: 1px solid ${defaultTheme.border};
          }

          .dialog-title {
            font-size: 18px;
            font-weight: 600;
            color: ${defaultTheme.text};
            margin: 0;
            line-height: 1.4;
          }

          .dialog-close {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            padding: 0;
            background: none;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            color: ${defaultTheme.textSecondary};
            transition: all 0.2s ease;
          }

          .dialog-close:hover {
            background-color: ${defaultTheme.backgroundGhost};
            color: ${defaultTheme.text};
          }

          .dialog-close:active {
            transform: scale(0.95);
          }

          .dialog-content {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
          }

          .dialog-content::-webkit-scrollbar {
            width: 8px;
          }

          .dialog-content::-webkit-scrollbar-track {
            background: transparent;
          }

          .dialog-content::-webkit-scrollbar-thumb {
            background-color: ${defaultTheme.border};
            border-radius: 4px;
            border: 2px solid transparent;
            background-clip: padding-box;
          }

          .dialog-content::-webkit-scrollbar-thumb:hover {
            background-color: ${defaultTheme.borderHover};
          }

          /* Mobile styles */
          @media (max-width: 640px) {
            .dialog-header {
              padding: 16px 20px;
            }

            .dialog-title {
              font-size: 16px;
            }

            .dialog-close {
              width: 28px;
              height: 28px;
            }

            .dialog-content {
              padding: 20px;
            }
          }

          /* Reduce motion */
          @media (prefers-reduced-motion: reduce) {
            .dialog-close {
              transition: none;
            }
          }
        `}
			</style>

			<div className={`dialog-container ${className}`}>
				<div className="dialog-header">
					<h2 className="dialog-title">{title}</h2>
					<button
						className="dialog-close"
						onClick={onClose}
						aria-label="Close dialog"
					>
						<XIcon size={16} />
					</button>
				</div>

				<div className="dialog-content">{children}</div>
			</div>
		</Modal>
	);
};

export default Dialog;
