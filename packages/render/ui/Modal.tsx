import type React from "react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useKey } from "react-use";
import { defaultTheme } from "render/styles/colors";

export const useModal = <T,>() => {
	const [visible, setVisible] = useState(false);
	const [modalState, setModalState] = useState<T | null>(null);

	const open = (item: T) => {
		setModalState(item);
		setVisible(true);
	};

	const close = () => {
		setVisible(false);
	};

	return { visible, open, close, modalState };
};

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
	useKey("Escape", onClose);

	if (!isOpen) return null;

	return createPortal(
		<>
			<style>
				{`
          .modal-overlay {
            position: fixed;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(4px);
            z-index: 1000;
            animation: fadeIn 0.2s ease-out;
            padding: 20px;
          }

          .modal-content {
            width: 91.666667%;
            max-width: 1200px;
            margin: auto;
            position: relative;
            transition: all 0.3s ease-out;
            box-shadow: 0 4px 24px ${defaultTheme.shadowMedium};
            animation: slideUp 0.3s ease-out;
          }

          .modal-image {
            width: 100%;
            height: auto;
            max-height: 85vh;
            object-fit: contain;
            border-radius: 12px;
            display: block;
            background: ${defaultTheme.backgroundSecondary};
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          /* Responsive breakpoints */
          @media (min-width: 640px) {
            .modal-content {
              width: 83.333333%;
            }
          }

          @media (min-width: 768px) {
            .modal-content {
              width: 75%;
            }
          }

          @media (min-width: 1024px) {
            .modal-content {
              width: 66.666667%;
            }
          }

          @media (min-width: 1280px) {
            .modal-content {
              width: 50%;
            }
            
            .modal-image {
              max-width: 1100px;
              max-height: 80vh;
            }
          }

          /* Reduce motion preference */
          @media (prefers-reduced-motion: reduce) {
            .modal-overlay,
            .modal-content {
              animation: none;
            }
          }
        `}
			</style>

			<div
				className="modal-overlay"
				onClick={(e) => {
					if (e.target === e.currentTarget) {
						onClose();
					}
				}}
			>
				<div className="modal-content" onClick={(e) => e.stopPropagation()}>
					{children}
				</div>
			</div>
		</>,
		document.body,
	);
};
