// Alert.tsx
import type React from "react";
import { useTranslation } from "react-i18next";
import { defaultTheme } from "render/styles/colors";
import { Modal, useModal } from "./Modal";

export const useDeleteAlert = (deleteCallback: (item: any) => void) => {
	const { visible, open, close, modalState } = useModal();

	return {
		visible,
		openAlert: open,
		closeAlert: close,
		doDelete: () => {
			deleteCallback(modalState);
			close();
		},
		modalState,
	};
};

interface AlertProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	title: string;
	message: string;
	type?: "info" | "warning" | "error" | "success";
	confirmText?: string;
	cancelText?: string;
	showCancel?: boolean;
}

export const Alert: React.FC<AlertProps> = ({
	isOpen,
	onClose,
	onConfirm,
	message,
	title,
	type = "info",
	confirmText,
	cancelText,
	showCancel = true,
}) => {
	const { t } = useTranslation();

	return (
		<Modal isOpen={isOpen} onClose={onClose} size="small" animation="scale">
			<style>
				{`
          .alert-container {
            padding: 2.5rem;
            width: 100%;
            border-radius: 16px;
            background-color: ${defaultTheme.backgroundSecondary};
            overflow: hidden;
          }

          .alert-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2rem;
            text-align: center;
          }

          .alert-title {
            font-size: 24px;
            font-weight: 600;
            color: ${defaultTheme.text};
            margin: 0;
            line-height: 1.3;
          }

          .alert-message {
            color: ${defaultTheme.textSecondary};
            font-size: 15px;
            line-height: 1.6;
            margin: 0;
            max-width: 85%;
          }

          .alert-buttons {
            display: flex;
            gap: 12px;
            justify-content: center;
            width: 100%;
          }

          .alert-button {
            min-width: 120px;
            padding: 10px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            border: none;
            outline: none;
            transition: all 0.2s ease;
          }

          .alert-button:active {
            transform: translateY(1px);
          }

          .alert-button-confirm {
            background-color: ${defaultTheme.primary};
            color: #fff;
          }

          .alert-button-confirm:hover {
            background-color: ${defaultTheme.hover};
            transform: translateY(-1px);
          }

          .alert-button-cancel {
            background-color: ${defaultTheme.backgroundSecondary};
            color: ${defaultTheme.text};
            border: 1px solid ${defaultTheme.border};
          }

          .alert-button-cancel:hover {
            border-color: ${defaultTheme.borderHover};
            background-color: ${defaultTheme.backgroundGhost};
            transform: translateY(-1px);
          }

          /* Type-specific styles */
          .alert-icon {
            width: 48px;
            height: 48px;
            margin-bottom: 0.5rem;
          }

          .alert-type-info .alert-button-confirm {
            background-color: ${defaultTheme.primary};
          }

          .alert-type-warning .alert-button-confirm {
            background-color: ${defaultTheme.error};
          }

          .alert-type-error .alert-button-confirm {
            background-color: ${defaultTheme.error};
          }

          .alert-type-success .alert-button-confirm {
            background-color: ${defaultTheme.primary};
          }

          /* Mobile styles */
          @media (max-width: 640px) {
            .alert-container {
              padding: 2rem;
            }

            .alert-title {
              font-size: 22px;
            }

            .alert-message {
              font-size: 14px;
              max-width: 95%;
            }

            .alert-button {
              min-width: 100px;
              padding: 8px 20px;
            }
          }

          /* Reduce motion */
          @media (prefers-reduced-motion: reduce) {
            .alert-button {
              transition: none;
            }
          }
        `}
			</style>

			<div className={`alert-container alert-type-${type}`}>
				<div className="alert-content">
					{/* 可以根据type添加对应的图标 */}
					{/* <div className="alert-icon">
            {type === 'warning' && <WarningIcon />}
            {type === 'error' && <ErrorIcon />}
            {type === 'success' && <SuccessIcon />}
            {type === 'info' && <InfoIcon />}
          </div> */}

					<h2 className="alert-title">{title}</h2>

					<p className="alert-message">{message}</p>

					<div className="alert-buttons">
						{showCancel && (
							<button
								className="alert-button alert-button-cancel"
								onClick={onClose}
							>
								{cancelText || t("cancel")}
							</button>
						)}
						<button
							className="alert-button alert-button-confirm"
							onClick={onConfirm}
						>
							{confirmText || t("confirm")}
						</button>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default Alert;
