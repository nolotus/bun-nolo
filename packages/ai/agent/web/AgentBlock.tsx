import { useCallback, useEffect, useState, lazy, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useAppDispatch } from "app/store";
import { remove } from "database/dbSlice";
import { Agent } from "app/types";
import { useCouldEdit } from "auth/hooks/useCouldEdit";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { useModal } from "render/ui/Modal";

import Avatar from "render/web/ui/Avatar";
import Button from "render/web/ui/Button";
import { Dialog } from "render/web/ui/modal/Dialog";

import {
  LuArrowRight,
  LuCoins,
  LuEye,
  LuMessageSquare,
  LuEllipsis,
  LuPencil,
  LuPlus,
  LuRefreshCw,
  LuStar,
  LuTrash2,
  LuX,
  LuCheck,
} from "react-icons/lu";

interface AgentBlockProps {
  item: Agent;
  reload: () => Promise<void>;
}

// 仅 AgentForm 懒加载（编辑相关）
const loadAgentForm = () => import("ai/llm/web/AgentForm"); // 默认导出
const AgentFormLazy = lazy(loadAgentForm);

// 预取编辑相关（这里只需预取 AgentForm）
const preloadEditBundle = () => {
  loadAgentForm();
};

const AgentBlock = ({ item, reload }: AgentBlockProps) => {
  const { t } = useTranslation("ai");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const agentKey = item.dbKey || item.id;
  const { isLoading, createNewDialog } = useCreateDialog();
  const { visible: editVisible, open: openEdit, close: closeEdit } = useModal();
  const [showActions, setShowActions] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const allowEdit = useCouldEdit(agentKey);

  const startDialog = async () => {
    if (isLoading) return;
    try {
      await createNewDialog({ agents: [agentKey] });
    } catch {
      toast.error(t("createDialogError"));
    }
  };

  const handleDelete = useCallback(async () => {
    if (deleting) return;
    setDeleting(true);

    try {
      const element = document.getElementById(`agent-${item.id}`);
      element?.classList.add("agent-exit");
      await new Promise((r) => setTimeout(r, 250));
      await dispatch(remove(agentKey));
      toast.success(t("deleteSuccess"));
      await reload();
    } catch {
      setDeleting(false);
      setConfirmingDelete(false);
      toast.error(t("deleteError"));
    }
  }, [item.id, agentKey, deleting, dispatch, reload, t]);

  const handleEdit = useCallback(() => {
    setShowActions(false);
    preloadEditBundle(); // 点击前预取
    openEdit();
  }, [openEdit]);

  const handleToggleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsFavorite((v) => !v);
      toast.success(
        !isFavorite ? t("addedToFavorites") : t("removedFromFavorites")
      );
    },
    [isFavorite, t]
  );

  const handleMoreClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const next = !showActions;
      setShowActions(next);
      if (next) preloadEditBundle(); // 展开菜单时预取
    },
    [showActions]
  );

  useEffect(() => {
    if (showActions) preloadEditBundle(); // 兜底
  }, [showActions]);

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/${agentKey}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmingDelete(true);
    setShowActions(false);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirmingDelete(false);
  };

  const confirmDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleDelete();
  };

  return (
    <>
      <div
        id={`agent-${item.id}`}
        className="agent"
        onClick={(e) => {
          if (
            e.target === e.currentTarget ||
            (e.target as Element).classList.contains("clickable")
          ) {
            handleViewDetails(e);
          }
        }}
      >
        {/* 右上角操作按钮 */}
        <div className="agent__top-actions">
          <button
            className={`agent__favorite ${isFavorite ? "agent__favorite--active" : ""}`}
            onClick={handleToggleFavorite}
            title={isFavorite ? t("removeFromFavorites") : t("addToFavorites")}
          >
            <LuStar size={18} />
          </button>

          {allowEdit && (
            <button
              className={`agent__more ${showActions ? "agent__more--active" : ""}`}
              onPointerEnter={preloadEditBundle}
              onFocus={preloadEditBundle}
              onClick={handleMoreClick}
              title={t("moreActions")}
            >
              <LuEllipsis size={18} />
            </button>
          )}
        </div>

        {/* 操作菜单 - 悬浮显示 */}
        {showActions && allowEdit && (
          <div className="agent__actions-menu">
            <button
              className="agent__action-item agent__action-item--edit"
              onPointerEnter={preloadEditBundle}
              onFocus={preloadEditBundle}
              onClick={handleEdit}
            >
              <LuPencil size={14} />
              <span>{t("edit")}</span>
            </button>
            <button
              className="agent__action-item agent__action-item--delete"
              onClick={handleDeleteClick}
            >
              <LuTrash2 size={14} />
              <span>{t("delete")}</span>
            </button>
          </div>
        )}

        {/* 删除确认栏 */}
        {confirmingDelete && (
          <div className="agent__delete-confirm">
            <div className="agent__delete-message">
              <LuTrash2 size={16} />
              <span>{t("confirmDelete")}</span>
            </div>
            <div className="agent__delete-actions">
              <button
                className="agent__delete-cancel"
                onClick={cancelDelete}
                disabled={deleting}
              >
                <LuX size={14} />
              </button>
              <button
                className="agent__delete-confirm-btn"
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <div className="agent__spinner" />
                ) : (
                  <LuCheck size={14} />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="agent__header">
          <div className="agent__avatar">
            <Avatar name={item.name} type="agent" size="large" />
          </div>

          <div className="agent__info">
            <div className="agent__title-row">
              <Link to={`/${agentKey}`} className="agent__title-link">
                <h3 className="agent__title">{item.name || t("unnamed")}</h3>
                <span className="agent__title-arrow">
                  <LuArrowRight size={14} />
                </span>
              </Link>
            </div>

            {item.outputPrice && (
              <div className="agent__price">
                <LuCoins size={12} />
                <span>{item.outputPrice.toFixed(2)}</span>
                <span className="agent__price-unit">
                  / {t("perMillionTokens")}
                </span>
              </div>
            )}

            <div className="agent__tags">
              {item.hasVision && (
                <span className="agent__tag agent__vision">
                  <LuEye size={11} />
                  <span>{t("vision")}</span>
                </span>
              )}
              {item.tags?.slice(0, 3).map((tag, i) => (
                <span key={i} className="agent__tag">
                  {tag}
                </span>
              ))}
              {item.tags && item.tags.length > 3 && (
                <span className="agent__tag agent__tag--more">
                  +{item.tags.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="agent__desc clickable">
          {item.introduction || t("noDescription")}
        </div>

        {/* Actions */}
        <div className="agent__actions">
          <Button
            icon={<LuMessageSquare size={16} />}
            onClick={startDialog}
            disabled={isLoading || confirmingDelete}
            loading={isLoading}
            size="medium"
            className="agent__primary"
          >
            {isLoading ? t("starting") : t("startChat")}
          </Button>
        </div>
      </div>

      {/* 编辑对话框（Dialog 同步加载；表单懒加载，Dialog 内展示占位） */}
      {editVisible && (
        <Dialog
          isOpen={editVisible}
          onClose={closeEdit}
          title={`${t("edit")} ${item.name || t("agent")}`}
          size="large"
        >
          <Suspense
            fallback={
              <div className="agent__dialog-body-fallback">
                <div className="agent__dialog-spinner" />
                <div className="agent__dialog-text">{t("loading")}</div>
              </div>
            }
          >
            <AgentFormLazy
              mode="edit"
              initialValues={item}
              onClose={closeEdit}
              CreateIcon={LuPlus}
              EditIcon={LuRefreshCw}
            />
          </Suspense>
        </Dialog>
      )}

      <style href="agent-block" precedence="medium">{`
        .agent {
          background: var(--background);
          border-radius: var(--space-3);
          padding: var(--space-5);
          border: 1px solid var(--border);
          transition: all 0.2s ease;
          cursor: pointer;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          height: 100%;
          overflow: visible;
        }

        .agent:hover {
          transform: translateY(-1px);
          border-color: var(--primary);
          box-shadow: 0 4px 12px var(--shadowLight);
        }

        .agent:has(.agent__delete-confirm) {
          border-color: var(--error);
          background: rgba(239, 68, 68, 0.02);
        }

        .agent__top-actions {
          position: absolute;
          top: var(--space-4);
          right: var(--space-4);
          display: flex;
          gap: var(--space-1);
          z-index: 10;
        }

        .agent__favorite,
        .agent__more {
          background: none;
          border: none;
          color: var(--textTertiary);
          padding: var(--space-2);
          border-radius: var(--space-2);
          transition: all 0.2s ease;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          opacity: 0.6;
        }

        .agent__favorite:hover {
          color: var(--warning);
          background: var(--backgroundHover);
          opacity: 1;
          transform: scale(1.1);
        }

        .agent__more:hover,
        .agent__more--active {
          color: var(--textSecondary);
          background: var(--backgroundHover);
          opacity: 1;
          transform: scale(1.1);
        }

        .agent__favorite--active {
          color: var(--warning);
          background: var(--backgroundHover);
          opacity: 1;
        }

        .agent__favorite--active svg {
          fill: currentColor;
        }

        .agent__actions-menu {
          position: absolute;
          top: var(--space-16);
          right: var(--space-4);
          background: var(--background);
          border: 1px solid var(--border);
          border-radius: var(--space-2);
          box-shadow: 0 4px 12px var(--shadowMedium);
          z-index: 20;
          overflow: hidden;
          min-width: 120px;
          animation: slideDown 0.15s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .agent__action-item {
          width: 100%;
          padding: var(--space-3) var(--space-4);
          border: none;
          background: none;
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.875rem;
          cursor: pointer;
          transition: background-color 0.15s ease;
          color: var(--textSecondary);
        }

        .agent__action-item:hover { background: var(--backgroundHover); }
        .agent__action-item--edit:hover { color: var(--primary); }
        .agent__action-item--delete:hover {
          color: var(--error);
          background: rgba(239, 68, 68, 0.05);
        }

        .agent__delete-confirm {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          background: var(--error);
          color: white;
          padding: var(--space-3) var(--space-4);
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: var(--space-3) var(--space-3) 0 0;
          animation: slideDownRed 0.2s ease-out;
          z-index: 15;
        }

        @keyframes slideDownRed {
          from { opacity: 0; transform: translateY(-100%); }
          to { opacity: 1; transform: translateY(0); }
        }

        .agent__delete-message {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .agent__delete-actions { display: flex; gap: var(--space-2); }

        .agent__delete-cancel,
        .agent__delete-confirm-btn {
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          width: 28px;
          height: 28px;
          border-radius: var(--space-1);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .agent__delete-cancel:hover { background: rgba(255, 255, 255, 0.3); }
        .agent__delete-confirm-btn:hover { background: rgba(255, 255, 255, 0.3); }
        .agent__delete-confirm-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .agent__spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .agent__header {
          display: flex;
          gap: var(--space-3);
          align-items: flex-start;
          padding-right: var(--space-12);
          margin-top: var(--space-0);
        }

        .agent:has(.agent__delete-confirm) .agent__header { margin-top: var(--space-12); }

        .agent__info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .agent__title-link {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          text-decoration: none;
          color: inherit;
        }

        .agent__title {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
          color: var(--text);
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: color 0.2s ease;
        }

        .agent:hover .agent__title { color: var(--primary); }

        .agent__title-arrow {
          color: var(--textTertiary);
          opacity: 0;
          transform: translateX(-4px);
          transition: all 0.2s ease;
        }

        .agent:hover .agent__title-arrow {
          opacity: 1;
          transform: translateX(0);
          color: var(--primary);
        }

        .agent__price {
          font-size: 0.8rem;
          color: var(--textTertiary);
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }

        .agent__price-unit {
          color: var(--textQuaternary);
          font-size: 0.75rem;
        }

        .agent__tags { display: flex; gap: var(--space-1); flex-wrap: wrap; }

        .agent__tag {
          font-size: 0.75rem;
          padding: var(--space-1) var(--space-2);
          background: var(--backgroundTertiary);
          border-radius: var(--space-1);
          color: var(--textTertiary);
          font-weight: 500;
          white-space: nowrap;
        }

        .agent__vision {
          display: flex;
          align-items: center;
          gap: 4px;
          color: var(--primary);
          background: var(--primaryGhost);
        }

        .agent__tag--more { color: var(--primary); background: var(--primaryGhost); }

        .agent__desc {
          flex: 1;
          font-size: 0.9rem;
          line-height: 1.5;
          color: var(--textSecondary);
          white-space: pre-wrap;
          overflow-y: auto;
          max-height: 90px;
          padding: var(--space-2) var(--space-3);
          background: var(--backgroundSecondary);
          border-radius: var(--space-2);
        }

        .agent__desc::-webkit-scrollbar { width: 4px; }
        .agent__desc::-webkit-scrollbar-thumb { background-color: var(--border); border-radius: 4px; }

        .agent__actions { display: flex; margin-top: auto; }
        .agent__primary { flex: 1; }

        .agent-exit {
          opacity: 0;
          transform: scale(0.95);
          transition: all 0.25s ease;
        }

        /* Dialog 内部的懒加载占位 */
        .agent__dialog-body-fallback {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 24px;
          min-height: 160px;
        }
        .agent__dialog-spinner {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(0,0,0,0.1);
          border-top: 3px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        .agent__dialog-text {
          color: var(--textSecondary);
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .agent { padding: var(--space-4); }
          .agent__top-actions { top: var(--space-3); right: var(--space-3); }
          .agent__header { padding-right: var(--space-10); }
          .agent__favorite, .agent__more { width: 32px; height: 32px; }
          .agent__title-arrow { opacity: 1; transform: none; }
          .agent__favorite, .agent__more { opacity: 1; }
          .agent__actions-menu { right: var(--space-3); }
        }

        @media (prefers-reduced-motion: reduce) {
          .agent,
          .agent__title-arrow,
          .agent__favorite,
          .agent__more,
          .agent__actions-menu,
          .agent__delete-confirm {
            transition: none;
            animation: none;
          }
          .agent:hover { transform: none; }
        }
      `}</style>
    </>
  );
};

export default AgentBlock;
