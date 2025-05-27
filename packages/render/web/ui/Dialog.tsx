// render/web/ui/Dialog.tsx
import { XIcon } from "@primer/octicons-react";
import React from "react";
import { useTheme } from "app/theme";
import { BaseModal } from "render/web/ui/BaseModal";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  fullScreenOnMobile?: boolean;
  size?: "small" | "medium" | "large" | "xlarge";
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = "",
  fullScreenOnMobile = true,
  size = "medium",
}) => {
  const theme = useTheme();

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return { width: "400px", minWidth: "400px", maxWidth: "400px" };
      case "large":
        return { width: "800px", minWidth: "800px", maxWidth: "800px" };
      case "xlarge":
        return { width: "1000px", minWidth: "1000px", maxWidth: "1000px" };
      default:
        return { width: "600px", minWidth: "600px", maxWidth: "600px" };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      variant="default"
      preventBodyScroll={true}
    >
      <div className={`dialog-container ${className} size-${size}`}>
        <div className="dialog-header">
          <h2 className="dialog-title">{title}</h2>
          <button
            className="dialog-close"
            onClick={onClose}
            aria-label="关闭对话框"
            type="button"
          >
            <XIcon size={16} />
          </button>
        </div>

        <div className="dialog-content">{children}</div>
      </div>

      <style href="dialog" precedence="medium">{`
        .dialog-container {
          display: flex;
          flex-direction: column;
          background: ${theme.background};
          /* 使用固定宽度，防止内容变化导致的尺寸跳动 */
          width: ${sizeStyles.width};
          min-width: ${sizeStyles.minWidth};
          max-width: ${sizeStyles.maxWidth};
          min-height: 200px;
          max-height: 90vh;
          border-radius: ${theme.space[3]};
          overflow: hidden;
          box-shadow: 0 20px 80px rgba(0, 0, 0, 0.08);
          margin: ${theme.space[4]};
          /* 确保内容不会影响容器宽度 */
          box-sizing: border-box;
        }

        /* 针对不同尺寸的特殊处理 */
        .dialog-container.size-large,
        .dialog-container.size-xlarge {
          max-height: 95vh;
        }

        .dialog-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: ${theme.space[8]} ${theme.space[8]} ${theme.space[6]};
          flex-shrink: 0;
          /* 确保标题区域不会被内容挤压 */
          min-height: 80px;
          box-sizing: border-box;
        }

        .dialog-title {
          font-size: 18px;
          font-weight: 600;
          color: ${theme.text};
          margin: 0;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          /* 确保标题不会超出固定宽度 */
          max-width: calc(100% - 60px);
        }

        .dialog-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          padding: 0;
          background: none;
          border: none;
          border-radius: ${theme.space[2]};
          cursor: pointer;
          color: ${theme.textTertiary};
          transition: all 0.15s ease;
          flex-shrink: 0;
          touch-action: manipulation;
        }

        .dialog-close:hover {
          background-color: ${theme.backgroundHover};
          color: ${theme.text};
        }

        .dialog-close:active {
          transform: scale(0.95);
          background-color: ${theme.backgroundSelected};
        }

        .dialog-close:focus-visible {
          outline: 2px solid ${theme.primary};
          outline-offset: 1px;
        }

        .dialog-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden; /* 防止水平滚动影响宽度 */
          padding: 0;
          -webkit-overflow-scrolling: touch;
          /* 确保内容区域不会超出容器 */
          box-sizing: border-box;
          width: 100%;
        }

        /* 更隐蔽的滚动条 */
        .dialog-content::-webkit-scrollbar {
          width: 3px;
        }

        .dialog-content::-webkit-scrollbar-track {
          background: transparent;
        }

        .dialog-content::-webkit-scrollbar-thumb {
          background-color: ${theme.textLight};
          border-radius: 2px;
          opacity: 0.3;
        }

        .dialog-content::-webkit-scrollbar-thumb:hover {
          opacity: 0.5;
        }

        /* 桌面端响应式 - 在空间不足时才调整宽度 */
        @media (min-width: 1601px) {
          .dialog-container.size-medium {
            width: 700px;
            min-width: 700px;
            max-width: 700px;
          }
          
          .dialog-container.size-large {
            width: 1000px;
            min-width: 1000px;
            max-width: 1000px;
          }
          
          .dialog-container.size-xlarge {
            width: 1300px;
            min-width: 1300px;
            max-width: 1300px;
          }
        }

        /* 当屏幕宽度小于对话框宽度时，才使用百分比 */
        @media (max-width: 1350px) {
          .dialog-container.size-xlarge {
            width: 95vw;
            min-width: 800px;
            max-width: 95vw;
          }
        }

        @media (max-width: 1050px) {
          .dialog-container.size-large {
            width: 90vw;
            min-width: 600px;
            max-width: 90vw;
          }
          
          .dialog-container.size-xlarge {
            width: 92vw;
            min-width: 600px;
            max-width: 92vw;
          }
        }

        @media (max-width: 850px) {
          .dialog-container.size-large,
          .dialog-container.size-xlarge {
            width: 95vw;
            min-width: 400px;
            max-width: 95vw;
          }
        }

        @media (max-width: 650px) {
          .dialog-container.size-medium {
            width: 90vw;
            min-width: 320px;
            max-width: 90vw;
          }
        }

        @media (max-width: 450px) {
          .dialog-container.size-small {
            width: 95vw;
            min-width: 300px;
            max-width: 95vw;
          }
        }

        /* 平板端优化 */
        @media (max-width: 768px) and (min-width: 641px) {
          .dialog-container {
            margin: ${theme.space[4]};
            border-radius: ${theme.space[2]};
          }

          .dialog-header {
            padding: ${theme.space[6]};
            min-height: 72px;
          }

          .dialog-title {
            font-size: 17px;
          }
        }

        /* 移动端全屏显示 */
        @media (max-width: 640px) {
          .dialog-container {
            width: 100vw !important;
            min-width: 100vw !important;
            max-width: 100vw !important;
            height: 100vh;
            max-height: 100vh;
            border-radius: 0;
            margin: 0;
            box-shadow: none;
          }

          .dialog-header {
            padding: ${theme.space[4]} ${theme.space[4]} ${theme.space[3]};
            min-height: 60px;
          }

          .dialog-title {
            font-size: 16px;
            max-width: calc(100% - 50px);
          }

          .dialog-close {
            width: 40px;
            height: 40px;
          }
        }

        /* 小屏手机优化 */
        @media (max-width: 375px) {
          .dialog-header {
            padding: ${theme.space[3]} ${theme.space[3]} ${theme.space[2]};
            min-height: 56px;
          }

          .dialog-title {
            font-size: 15px;
          }

          .dialog-close {
            width: 36px;
            height: 36px;
          }
        }

        /* 横屏手机优化 */
        @media (max-width: 640px) and (orientation: landscape) and (max-height: 500px) {
          .dialog-header {
            padding: ${theme.space[2]} ${theme.space[4]} ${theme.space[1]};
            min-height: 48px;
          }

          .dialog-title {
            font-size: 14px;
          }

          .dialog-close {
            width: 32px;
            height: 32px;
          }
        }

        /* 触摸设备优化 */
        @media (hover: none) and (pointer: coarse) {
          .dialog-close:hover {
            background-color: transparent;
          }
        }

        /* 无障碍支持 */
        @media (prefers-reduced-motion: reduce) {
          .dialog-close {
            transition: none;
          }
          
          .dialog-close:active {
            transform: none;
          }
        }

        /* 高分辨率屏幕优化 */
        @media (min-resolution: 2dppx) {
          .dialog-container {
            box-shadow: 0 20px 80px rgba(0, 0, 0, 0.1);
          }
        }
      `}</style>
    </BaseModal>
  );
};

export default Dialog;
