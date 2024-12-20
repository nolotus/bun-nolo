// Modal.tsx
import type React from "react";
import { useEffect, useState } from "react";
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
		// 动画结束后再清空状态
		setTimeout(() => {
			setModalState(null);
		}, 300);
	};

	return { visible, open, close, modalState };
};

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
	size?: "auto" | "small" | "medium" | "large" | "full";
	className?: string;
	overlayClassName?: string;
	closeOnOverlayClick?: boolean;
	closeOnEsc?: boolean;
	disableScroll?: boolean;
	centered?: boolean;
	animation?: "none" | "fade" | "slide" | "scale";
}

export const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	children,
	size = "medium",
	className = "",
	overlayClassName = "",
	closeOnOverlayClick = true,
	closeOnEsc = true,
	disableScroll = true,
	centered = true,
	animation = "slide",
}) => {
	useEffect(() => {
		if (disableScroll) {
			if (isOpen) {
				document.body.style.overflow = "hidden";
			} else {
				document.body.style.overflow = "";
			}
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen, disableScroll]);

	useKey("Escape", () => {
		if (closeOnEsc && isOpen) {
			onClose();
		}
	});

	if (!isOpen) return null;

	return createPortal(
		<>
			<style>
				{`
          .modal-overlay {
            position: fixed;
            inset: 0;
            display: flex;
            z-index: 1000;
            background-color: rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            padding: 20px;
            opacity: 0;
            transition: opacity 0.3s ease;
          }

          .modal-overlay.centered {
            align-items: center;
            justify-content: center;
          }

          .modal-overlay.top {
            align-items: flex-start;
            justify-content: center;
          }

          .modal-overlay.visible {
            opacity: 1;
          }

          .modal-content {
            position: relative;
            margin: auto;
            background: ${defaultTheme.background};
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s ease;
          }

          .modal-content.visible {
            opacity: 1;
            transform: translateY(0);
          }

          /* Modal sizes */
          .modal-content.size-auto {
            width: auto;
            max-width: none;
          }

          .modal-content.size-small {
            width: 90%;
            max-width: 460px;
          }

          .modal-content.size-medium {
            width: 90%;
            max-width: 640px;
          }

          .modal-content.size-large {
            width: 90%;
            max-width: 1200px;
          }

          .modal-content.size-full {
            width: 95%;
            max-width: none;
            min-height: 90vh;
          }

          /* Animations */
          .modal-content.animation-fade {
            transform: none;
          }

          .modal-content.animation-scale {
            transform: scale(0.95);
          }

          .modal-content.animation-scale.visible {
            transform: scale(1);
          }

          .modal-content.animation-slide {
            transform: translateY(20px);
          }

          .modal-content.animation-slide.visible {
            transform: translateY(0);
          }

          .modal-content.animation-none {
            transition: none;
            transform: none;
            opacity: 1;
          }

          /* Mobile styles */
          @media (max-width: 640px) {
            .modal-overlay {
              padding: 16px;
            }

            .modal-content {
              width: 95%;
              max-width: none;
            }
          }

          /* Reduce motion */
          @media (prefers-reduced-motion: reduce) {
            .modal-overlay,
            .modal-content {
              animation: none;
              transition: none;
            }
          }
        `}
			</style>

			<div
				className={`modal-overlay ${centered ? "centered" : "top"} ${
					isOpen ? "visible" : ""
				} ${overlayClassName}`}
				onClick={(e) => {
					if (closeOnOverlayClick && e.target === e.currentTarget) {
						onClose();
					}
				}}
				role="dialog"
				aria-modal="true"
			>
				<div
					className={`
            modal-content 
            size-${size} 
            animation-${animation}
            ${isOpen ? "visible" : ""} 
            ${className}
          `}
					onClick={(e) => e.stopPropagation()}
					role="document"
				>
					{children}
				</div>
			</div>
		</>,
		document.body,
	);
};

// 为了更好的类型提示，导出类型
export type ModalSize = "auto" | "small" | "medium" | "large" | "full";
export type ModalAnimation = "none" | "fade" | "slide" | "scale";

export default Modal;
