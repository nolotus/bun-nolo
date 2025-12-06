import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom"; // 引入 Portal
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LuEllipsis, LuTrash2, LuInfo } from "react-icons/lu";
import { useAppDispatch, useAppSelector } from "app/store";
import {
  deleteCurrentDialog,
  selectTotalDialogTokens,
} from "chat/dialog/dialogSlice";
import DialogInfoPanel from "chat/dialog/DialogInfoPanel";
import { Tooltip } from "render/web/ui/Tooltip";
import { ConfirmModal } from "render/web/ui/modal/ConfirmModal";
import { zIndex } from "render/styles/zIndex"; // 引入你定义的 zIndex

// --- Types ---
interface MenuButtonProps {
  icon: React.ReactNode;
  label?: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  isMobile?: boolean;
  isDanger?: boolean;
}

// --- Components ---

const MenuButton: React.FC<MenuButtonProps> = ({
  icon,
  label,
  onClick,
  disabled,
  className = "",
  isMobile = false,
  isDanger = false,
}) => (
  <button
    className={`
      menu-button 
      ${isMobile ? "menu-button--mobile" : ""} 
      ${isDanger ? "menu-button--danger" : ""} 
      ${className}
    `}
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    type="button"
  >
    {disabled ? <div className="menu-button__spinner" /> : icon}
    {isMobile && label && <span className="menu-button__text">{label}</span>}
  </button>
);

const DeleteButton = ({
  currentDialog,
  isMobile = false,
}: {
  currentDialog: any;
  isMobile?: boolean;
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    setBusy(true);
    try {
      await dispatch(
        deleteCurrentDialog(currentDialog.dbKey || currentDialog.id)
      ).unwrap();
      toast.success(t("deleteSuccess"));
      navigate("/");
    } catch {
      toast.error(t("deleteFailed"));
    } finally {
      setBusy(false);
      setIsOpen(false);
    }
  };

  const btnContent = (
    <MenuButton
      icon={<LuTrash2 size={16} />}
      label={t("delete")}
      onClick={() => setIsOpen(true)}
      disabled={busy}
      isMobile={isMobile}
      isDanger={true}
    />
  );

  return (
    <>
      {isMobile ? (
        btnContent
      ) : (
        <Tooltip content={t("delete")}>{btnContent}</Tooltip>
      )}
      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleDelete}
        title={t("deleteDialogTitle", { title: currentDialog.title })}
        message={t("deleteDialogConfirmation")}
        type="error"
        loading={busy}
      />
    </>
  );
};

// --- Portal 下拉菜单内容 ---
const MobileMenuContent = ({
  onClose,
  anchorRect,
  children,
}: {
  onClose: () => void;
  anchorRect: DOMRect | null;
  children: React.ReactNode;
}) => {
  if (!anchorRect) return null;

  // 计算位置：让菜单右上角对齐按钮的右下角
  // 留出一定的边距 padding
  const style: React.CSSProperties = {
    position: "absolute",
    top: anchorRect.bottom + 8,
    right: window.innerWidth - anchorRect.right, // 靠右对齐
  };

  return createPortal(
    <>
      <div className="mobile-menu-overlay" onClick={onClose} />
      <div className="mobile-menu-dropdown" style={style}>
        {children}
      </div>
      <style>{`
        .mobile-menu-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(1px);
          z-index: ${zIndex.topbarMenuBackdrop}; /* 1010 */
          animation: fade-in 0.2s ease;
        }
        .mobile-menu-dropdown {
          min-width: 240px;
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: 0 4px 12px var(--shadowMedium);
          z-index: ${zIndex.topbarMenu}; /* 1020 */
          overflow: hidden;
          transform-origin: top right;
          animation: dropdown-scale-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes dropdown-scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>,
    document.body
  );
};

const MobileMenu = ({
  currentDialog,
  tokens,
}: {
  currentDialog: any;
  tokens: number;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  const { t } = useTranslation(["common"]);

  const toggleMenu = () => {
    if (!isOpen && buttonRef.current) {
      setAnchorRect(buttonRef.current.getBoundingClientRect());
    }
    setIsOpen(!isOpen);
  };

  // 监听窗口大小变化以更新位置（可选）
  useEffect(() => {
    if (isOpen) {
      const handleResize = () => setIsOpen(false); // 简单处理：窗口变化时关闭菜单
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [isOpen]);

  return (
    <div className="mobile-menu-trigger">
      <div ref={buttonRef}>
        <MenuButton
          icon={<LuEllipsis size={18} />}
          onClick={toggleMenu}
          className={isOpen ? "menu-button--active" : ""}
        />
      </div>

      {isOpen && (
        <MobileMenuContent
          onClose={() => setIsOpen(false)}
          anchorRect={anchorRect}
        >
          {/* 信息面板区域 */}
          <div className="mobile-menu__section mobile-menu__section--border">
            <DialogInfoPanel isMobile />
          </div>

          {/* 操作区域 */}
          <div className="mobile-menu__section">
            <div className="mobile-menu__token-badge">
              <LuInfo size={14} />
              <span>
                {t("common:tokens")}: {tokens?.toLocaleString() ?? 0}
              </span>
            </div>
            <DeleteButton currentDialog={currentDialog} isMobile />
          </div>
        </MobileMenuContent>
      )}

      {/* 仅保留内容样式，结构样式移至 Portal 内 */}
      <style href="MobileMenuItems" precedence="components">{`
        .mobile-menu__section {
          padding: 6px;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .mobile-menu__section--border {
          border-bottom: 1px solid var(--borderLight);
          background: var(--backgroundSecondary);
          padding: 12px;
        }
        .mobile-menu__token-badge {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          font-size: 12px;
          color: var(--textTertiary);
          background: transparent;
          margin-bottom: 4px;
          user-select: none;
        }
      `}</style>
    </div>
  );
};

// ... DialogMenu 主组件部分保持不变，但要确保 styles 不冲突 ...
const DialogMenu = ({ currentDialog }: { currentDialog: any }) => {
  // ... 代码与之前相同 ...
  // 主要是 MobileMenu 被替换了
  const { t } = useTranslation(["common"]);
  const tokens = useAppSelector(selectTotalDialogTokens);

  return (
    <div className="dialog-menu">
      <div className="dialog-menu__header">
        <h1 className="dialog-menu__title" title={currentDialog.title}>
          {currentDialog.title}
        </h1>
      </div>

      <div className="dialog-menu__actions dialog-menu__actions--desktop">
        <DialogInfoPanel />
        <Tooltip
          content={`${t("common:tokens")}: ${tokens?.toLocaleString() ?? "0"}`}
        >
          <div className="menu-icon-wrapper">
            <LuInfo size={16} />
          </div>
        </Tooltip>
        <DeleteButton currentDialog={currentDialog} />
      </div>

      <div className="dialog-menu__actions dialog-menu__actions--mobile">
        <MobileMenu currentDialog={currentDialog} tokens={tokens || 0} />
      </div>

      <style href="DialogMenu" precedence="components">{`
        .dialog-menu {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: var(--space-3);
          height: 100%;
        }
        .dialog-menu__header {
          flex: 1;
          min-width: 0;
          display: flex;
          justify-content: center;
        }
        .dialog-menu__title {
          margin: 0;
          font-size: 15px;
          font-weight: 600;
          color: var(--text);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          text-align: center;
          max-width: 100%;
          line-height: 1.5;
        }
        .dialog-menu__actions {
          display: flex;
          align-items: center;
          gap: 2px;
          flex-shrink: 0;
        }
        .dialog-menu__actions--mobile { display: none; }
        .dialog-menu__actions--desktop { display: flex; }

        .menu-button {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 6px;
          color: var(--textSecondary);
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .menu-button:hover:not(:disabled),
        .menu-button--active {
          background: var(--backgroundHover);
          color: var(--text);
        }
        .menu-button:disabled { opacity: 0.5; cursor: wait; }
        .menu-button--danger:hover:not(:disabled) {
          background: var(--errorBg, rgba(239, 68, 68, 0.1));
          color: var(--error);
        }
        /* Mobile specific styles */
        .menu-button--mobile {
          width: 100%;
          height: 40px;
          justify-content: flex-start;
          padding: 0 12px;
          gap: 12px;
          font-size: 14px;
          color: var(--text);
        }
        .menu-button__spinner {
          width: 14px; height: 14px;
          border: 2px solid var(--border); border-top-color: var(--primary);
          border-radius: 50%; animation: menu-spin 0.8s linear infinite;
        }
        /* Info Icon Wrapper */
        .menu-icon-wrapper {
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px;
          color: var(--textSecondary); cursor: help;
          border-radius: 6px;
        }
        .menu-icon-wrapper:hover { background: var(--backgroundHover); color: var(--primary); }
        @keyframes menu-spin { to { transform: rotate(360deg); } }
        
        @media (max-width: 768px) {
          .dialog-menu__actions--desktop { display: none; }
          .dialog-menu__actions--mobile { display: flex; }
          .dialog-menu__header { justify-content: flex-start; }
          .dialog-menu__title { text-align: left; font-size: 16px; }
        }
      `}</style>
    </div>
  );
};

export default DialogMenu;
