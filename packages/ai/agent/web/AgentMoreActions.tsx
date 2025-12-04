import { useState, useCallback } from "react";
import type { MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { LuEllipsis, LuPencil, LuTrash2 } from "react-icons/lu";
import { ConfirmModal } from "render/web/ui/modal/ConfirmModal";

interface AgentMoreActionsProps {
  preloadEditBundle: () => void;
  onEdit: () => void;
  // 由 AgentBlock 提供的真正删除函数（含 dispatch + reload + toast）
  onDelete: () => Promise<void>;
}

const AgentMoreActions = ({
  preloadEditBundle,
  onEdit,
  onDelete,
}: AgentMoreActionsProps) => {
  const { t } = useTranslation(["ai"]);

  const [showActions, setShowActions] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const stopEvent = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMoreClick = useCallback(
    (e: MouseEvent) => {
      stopEvent(e);
      setShowActions((prev) => {
        const next = !prev;
        if (next) {
          // 菜单即将展开时预加载编辑表单 bundle
          preloadEditBundle();
        }
        return next;
      });
    },
    [preloadEditBundle]
  );

  const handleEditClick = (e: MouseEvent) => {
    stopEvent(e);
    setShowActions(false);
    preloadEditBundle();
    onEdit();
  };

  // 点击菜单中的删除：只负责打开 ConfirmModal
  const handleDeleteMenuClick = (e: MouseEvent) => {
    stopEvent(e);
    setShowActions(false);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    if (deleting) return;
    setDeleteModalOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await onDelete(); // 调用 AgentBlock 提供的删除逻辑
      setDeleteModalOpen(false); // 成功后关闭弹窗
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* 顶部 more 按钮和下拉菜单 */}
      <div className="agent__top-actions">
        <button
          className={`agent__more ${showActions ? "agent__more--active" : ""}`}
          onPointerEnter={preloadEditBundle}
          onFocus={preloadEditBundle}
          onClick={handleMoreClick}
          title={t("moreActions")}
        >
          <LuEllipsis size={18} />
        </button>
      </div>

      {showActions && (
        <div className="agent__actions-menu">
          <button
            className="agent__action-item agent__action-item--edit"
            onPointerEnter={preloadEditBundle}
            onFocus={preloadEditBundle}
            onClick={handleEditClick}
          >
            <LuPencil size={14} />
            <span>{t("edit")}</span>
          </button>
          <button
            className="agent__action-item agent__action-item--delete"
            onClick={handleDeleteMenuClick}
          >
            <LuTrash2 size={14} />
            <span>{t("delete")}</span>
          </button>
        </div>
      )}

      {/* 删除确认弹窗：只在有编辑权限且点击删除时才会加载（整个组件是懒加载的） */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title={t("delete")}
        message={t("confirmDelete")}
        confirmText={t("delete")}
        cancelText={t("cancel")}
        type="error"
        loading={deleting}
      />

      <style href="agent-more-actions" precedence="medium">{`
        .agent__top-actions {
          position: absolute;
          top: var(--space-4);
          right: var(--space-4);
          z-index: 10;
        }

        .agent__more {
          background: transparent;
          border: none;
          color: var(--textTertiary);
          padding: 0;
          width: 28px;
          height: 28px;
          border-radius: var(--space-2);
          transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
        }

        .agent:hover .agent__more,
        .agent__more:focus,
        .agent__more--active {
          opacity: 1;
          color: var(--textSecondary);
          background: var(--backgroundSecondary);
        }

        .agent__more:hover,
        .agent__more--active {
          color: var(--text);
          transform: scale(1.05);
          background: var(--backgroundTertiary);
        }

        .agent__actions-menu {
          position: absolute;
          top: var(--space-12);
          right: var(--space-4);
          background: var(--background);
          border-radius: var(--space-3);
          z-index: 20;
          overflow: hidden;
          min-width: 110px;
          animation: slideDownMore 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          backdrop-filter: blur(10px) saturate(1.1);
          -webkit-backdrop-filter: blur(10px) saturate(1.1);
          box-shadow:
            0 0 0 0.5px var(--borderLight),
            0 8px 20px -4px var(--shadowMedium);
        }

        @keyframes slideDownMore {
          from { opacity: 0; transform: translateY(-4px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .agent__action-item {
          width: 100%;
          padding: var(--space-2) var(--space-3);
          border: none;
          background: none;
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.85rem;
          cursor: pointer;
          transition: background-color 0.15s ease, color 0.15s ease;
          color: var(--textSecondary);
        }

        .agent__action-item:hover {
          background: var(--backgroundHover);
          color: var(--text);
        }

        .agent__action-item--edit:hover {
          color: var(--primary);
        }

        .agent__action-item--delete:hover {
          color: var(--error);
          background: var(--backgroundSelected);
        }

        @media (max-width: 768px) {
          .agent__more {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .agent__more,
          .agent__actions-menu {
            transition: none;
            animation: none;
          }
        }
      `}</style>
    </>
  );
};

export default AgentMoreActions;
