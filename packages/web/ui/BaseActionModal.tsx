// web/ui/BaseActionModal.tsx
import React, { useEffect, useState, useRef } from "react"; // --- 1. 引入 useRef ---
import { BaseModal } from "render/web/ui/BaseModal";
import { useTheme } from "app/theme";

// Props 接口定义保持不变
interface BaseActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions: React.ReactNode;
  status?: "info" | "warning" | "error" | "success";
  titleIcon?: React.ReactNode;
  headerExtra?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  width?: number | string;
  onEnterPress?: () => void;
  isActionDisabled?: boolean;
}

export const BaseActionModal: React.FC<BaseActionModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  actions,
  status = "info",
  titleIcon,
  headerExtra,
  className = "",
  bodyClassName = "",
  width = 400,
  onEnterPress,
  isActionDisabled = false,
}) => {
  const theme = useTheme();
  const [animateIn, setAnimateIn] = useState(false);
  const { space: sp } = theme;
  const modalRef = useRef<HTMLDivElement>(null); // --- 2. 创建一个 ref 来引用弹窗容器 ---

  // 入场动画逻辑 (无变化)
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setAnimateIn(true), 50);
      return () => clearTimeout(timer);
    } else {
      setAnimateIn(false);
    }
  }, [isOpen]);

  // --- 3. 新增：当弹窗打开时，自动聚焦到弹窗 ---
  useEffect(() => {
    if (isOpen) {
      // 使用一个短暂的延时，确保弹窗渲染并可见后再聚焦
      const timer = setTimeout(() => {
        modalRef.current?.focus();
      }, 50); // 50ms 通常足够
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // 键盘事件监听 (无变化)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isActionDisabled) {
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key === "Enter" && onEnterPress) {
        if (
          !(event.target instanceof HTMLButtonElement) &&
          !(event.target instanceof HTMLInputElement) &&
          !(event.target instanceof HTMLTextAreaElement)
        ) {
          event.preventDefault();
          onEnterPress();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, onEnterPress, isActionDisabled]);

  const getStatusColor = () => {
    switch (status) {
      case "error":
        return theme.error;
      case "warning":
        return theme.warning || theme.primary; // fallback 如果没有 warning 色
      case "success":
        return theme.success || theme.primary; // fallback 如果没有 success 色
      default:
        return theme.primary;
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      variant="default"
      preventBodyScroll={true}
      className={`action-modal ${className} ${animateIn ? "animate-in" : ""}`}
    >
      {/* --- 4. 将 ref 和 tabIndex 应用到弹窗主容器上 --- */}
      <div
        ref={modalRef}
        tabIndex={-1} // tabIndex="-1" 使元素可以通过 JS 聚焦，但用户不能通过 Tab 键手动聚焦
        className="modal-container"
        style={{ outline: "none" }} // 移除聚焦时的默认蓝色轮廓
      >
        <div className="modal-header">
          <div className="title-wrapper">
            {titleIcon && <span className="title-icon">{titleIcon}</span>}
            <h3 className="title">{title}</h3>
          </div>
          {headerExtra && <div className="header-extra">{headerExtra}</div>}
        </div>

        <div className={`modal-body ${bodyClassName}`}>{children}</div>

        {actions && <div className="modal-actions">{actions}</div>}
      </div>

      <style href="base-action-modal" precedence="medium">{`
        .action-modal {
          background: ${theme.background};
          border-radius: 12px;
          box-shadow:
            0 0 0 1px ${theme.border},
            0 10px 15px -3px ${theme.shadowLight},
            0 4px 6px -2px ${theme.shadowMedium};
          width: 100%;
          max-width: ${typeof width === "number" ? `${width}px` : width};
          margin: ${sp[4]};
          overflow: hidden;
          opacity: 0;
          transform: scale(0.95) translateY(10px);
          transition: all 0.2s ease-out;
        }

        .action-modal.animate-in {
          opacity: 1;
          transform: scale(1) translateY(0);
        }

        .modal-container {
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          padding: ${sp[5]} ${sp[6]} ${sp[4]};
          border-bottom: 1px solid ${theme.backgroundTertiary};
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: ${sp[4]};
        }

        .title-wrapper {
          display: flex;
          align-items: center;
          gap: ${sp[2]};
          color: ${getStatusColor()};
        }

        .title-icon {
          display: flex;
          align-items: center;
          font-size: 20px;
        }

        .title {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: ${theme.text};
          letter-spacing: -0.01em;
        }

        .header-extra {
          flex-shrink: 0;
        }

        .modal-body {
          padding: ${sp[6]} ${sp[6]} ${sp[4]};
          flex: 1;
          overflow-y: auto;
          color: ${theme.textSecondary};
          font-size: 14px;
          line-height: 1.6;
          -webkit-overflow-scrolling: touch;
        }

        .modal-actions {
          padding: ${sp[2]} ${sp[6]} ${sp[6]};
          display: flex;
          justify-content: flex-end;
          gap: ${sp[3]};
        }

        /* 移动端优化 */
        @media (max-width: 640px) {
          .action-modal {
            margin: 0;
            max-width: 100%;
            width: 100vw;
            height: 100vh;
            border-radius: 0;
            transform: translateY(20px);
          }

          .action-modal.animate-in {
            transform: translateY(0);
          }

          .modal-container {
            height: 100%;
          }

          .modal-header {
            padding: ${sp[4]} ${sp[4]} ${sp[3]};
          }

          .title {
            font-size: 16px;
          }

          .modal-body {
            padding: ${sp[4]} ${sp[4]} ${sp[2]};
            height: calc(100vh - 140px);
          }

          .modal-actions {
            padding: ${sp[3]} ${sp[4]} ${sp[5]};
            margin-top: auto;
          }
        }

        /* 平板端优化 */
        @media (max-width: 768px) and (min-width: 641px) {
          .action-modal {
            margin: ${sp[4]};
            max-width: 90%;
          }
        }

        /* 无障碍支持 */
        @media (prefers-reduced-motion: reduce) {
          .action-modal {
            transition: none;
          }
        }
      `}</style>
    </BaseModal>
  );
};

export default BaseActionModal;
