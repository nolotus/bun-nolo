import { useCallback, useState, lazy, Suspense } from "react";
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
  LuTrash2,
  LuX,
  LuCheck,
} from "react-icons/lu";

interface AgentBlockProps {
  item: Agent;
  reload: () => Promise<void>;
}

const loadAgentForm = () => import("ai/llm/web/AgentForm");
const AgentFormLazy = lazy(loadAgentForm);

const preloadEditBundle = () => {
  loadAgentForm();
};

const AgentBlock = ({ item, reload }: AgentBlockProps) => {
  const { t } = useTranslation(["ai"]);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const agentKey = item.dbKey || item.id;
  const { isLoading, createNewDialog } = useCreateDialog();
  const { visible: editVisible, open: openEdit, close: closeEdit } = useModal();
  const [showActions, setShowActions] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const allowEdit = useCouldEdit(agentKey);

  const stopEvent = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

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
    preloadEditBundle();
    openEdit();
  }, [openEdit]);

  const handleMoreClick = useCallback(
    (e: React.MouseEvent) => {
      stopEvent(e);
      const next = !showActions;
      setShowActions(next);
      if (next) preloadEditBundle();
    },
    [showActions]
  );

  const handleViewDetails = (e: React.MouseEvent) => {
    stopEvent(e);
    navigate(`/${agentKey}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    stopEvent(e);
    setConfirmingDelete(true);
    setShowActions(false);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    stopEvent(e);
    setConfirmingDelete(false);
  };

  const confirmDelete = (e: React.MouseEvent) => {
    stopEvent(e);
    handleDelete();
  };

  // 点击卡片空白区域或 .clickable 元素时进入详情
  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      e.target === e.currentTarget ||
      (e.target as Element).classList.contains("clickable")
    ) {
      handleViewDetails(e);
    }
  };

  return (
    <>
      <div id={`agent-${item.id}`} className="agent" onClick={handleCardClick}>
        {allowEdit && (
          <div className="agent__top-actions">
            <button
              className={`agent__more ${
                showActions ? "agent__more--active" : ""
              }`}
              onPointerEnter={preloadEditBundle}
              onFocus={preloadEditBundle}
              onClick={handleMoreClick}
              title={t("moreActions")}
            >
              <LuEllipsis size={18} />
            </button>
          </div>
        )}

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

        {confirmingDelete && (
          <div className="agent__delete-confirm">
            <div className="agent__delete-message">
              <LuTrash2 size={16} />
              <span>{t("confirmDelete")}</span>
            </div>
            <div className="agent__delete-actions">
              <button
                className="agent__delete-btn agent__delete-btn--cancel"
                onClick={cancelDelete}
                disabled={deleting}
              >
                <LuX size={14} />
              </button>
              <button
                className="agent__delete-btn agent__delete-btn--confirm"
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

        <div className="agent__desc clickable">
          {item.introduction || t("noDescription")}
        </div>

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
          /* 固定卡片高度：列表对齐依赖该值，如需调整布局请优先改内部元素，避免随意提高此高度 */
          --agent-card-height: 220px;

          background: var(--background);
          border-radius: var(--space-3);
          padding: var(--space-5);
          border: none;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          height: var(--agent-card-height);
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(0, 0, 0, 0.03),
            0 4px 12px -2px rgba(0, 0, 0, 0.06),
            0 12px 32px -4px rgba(0, 0, 0, 0.08);
          backdrop-filter: blur(10px) saturate(1.1);
          -webkit-backdrop-filter: blur(10px) saturate(1.1);
        }

        @media (prefers-color-scheme: dark) {
          .agent {
            background: rgba(255, 255, 255, 0.02);
            box-shadow:
              0 0 0 1px rgba(255, 255, 255, 0.06),
              0 4px 12px -2px rgba(0, 0, 0, 0.5),
              0 12px 32px -4px rgba(0, 0, 0, 0.4);
            backdrop-filter: blur(16px) saturate(1.2);
            -webkit-backdrop-filter: blur(16px) saturate(1.2);
          }
        }

        .agent:hover {
          transform: translateY(-4px);
          box-shadow:
            0 0 0 1px var(--primaryGhost),
            0 4px 12px -2px rgba(0, 0, 0, 0.06),
            0 12px 32px -4px rgba(0, 0, 0, 0.08);
        }

        @media (prefers-color-scheme: dark) {
          .agent:hover {
            box-shadow:
              0 0 0 1px var(--primary),
              0 4px 12px -2px rgba(0, 0, 0, 0.5),
              0 12px 32px -4px rgba(0, 0, 0, 0.4);
          }
        }

        .agent:has(.agent__delete-confirm) {
          background: rgba(239, 68, 68, 0.02);
          box-shadow:
            0 0 0 1px rgba(239, 68, 68, 0.2),
            0 8px 30px -4px rgba(239, 68, 68, 0.12);
        }

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
          background: rgba(0, 0, 0, 0.04);
        }

        @media (prefers-color-scheme: dark) {
          .agent:hover .agent__more,
          .agent__more:focus,
          .agent__more--active {
            background: rgba(255, 255, 255, 0.1);
          }
        }

        .agent__more:hover,
        .agent__more--active {
          color: var(--text);
          transform: scale(1.05);
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
          animation: slideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          backdrop-filter: blur(20px) saturate(1.8);
          -webkit-backdrop-filter: blur(20px) saturate(1.8);
          box-shadow:
            0 0 0 0.5px rgba(0, 0, 0, 0.08),
            0 8px 20px -4px rgba(0, 0, 0, 0.12);
        }

        @media (prefers-color-scheme: dark) {
          .agent__actions-menu {
            background: rgba(30, 30, 30, 0.8);
            box-shadow:
              0 0 0 0.5px rgba(255, 255, 255, 0.1),
              0 12px 32px -4px rgba(0, 0, 0, 0.5);
          }
        }

        @keyframes slideDown {
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
          background: rgba(239, 68, 68, 0.08);
        }

        .agent__delete-confirm {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          background: var(--error);
          color: white;
          padding: var(--space-2) var(--space-4);
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: var(--space-3) var(--space-3) 0 0;
          animation: slideDownRed 0.2s ease-out;
          z-index: 15;
          height: 44px;
        }

        @keyframes slideDownRed {
          from { opacity: 0; transform: translateY(-100%); }
          to { opacity: 1; transform: translateY(0); }
        }

        .agent__delete-message {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.85rem;
          font-weight: 500;
        }

        .agent__delete-actions {
          display: flex;
          gap: var(--space-2);
        }

        .agent__delete-btn {
          background: rgba(255, 255, 255, 0.15);
          border: none;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: var(--space-1);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s ease, transform 0.15s ease;
        }

        .agent__delete-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-1px);
        }

        .agent__spinner {
          width: 12px;
          height: 12px;
          border: 1.5px solid rgba(255, 255, 255, 0.3);
          border-top: 1.5px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .agent__header {
          display: flex;
          gap: var(--space-3);
          align-items: flex-start;
          padding-right: var(--space-8);
          margin-top: var(--space-1);
        }

        .agent:has(.agent__delete-confirm) .agent__header {
          margin-top: var(--space-8);
        }

        .agent__info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .agent__title-link {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          text-decoration: none;
          color: inherit;
          max-width: 100%;
        }

        .agent__title {
          font-size: 1.05rem;
          font-weight: 600;
          margin: 0;
          color: var(--text);
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          transition: color 0.2s ease;
        }

        .agent:hover .agent__title {
          color: var(--primary);
        }

        .agent__title-arrow {
          color: var(--textTertiary);
          opacity: 0;
          transform: translateX(-4px);
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
        }

        .agent:hover .agent__title-arrow {
          opacity: 1;
          transform: translateX(0);
          color: var(--primary);
        }

        .agent__price {
          font-size: 0.75rem;
          color: var(--textTertiary);
          display: flex;
          align-items: center;
          gap: var(--space-1);
          margin-top: 2px;
        }

        .agent__price-unit {
          color: var(--textQuaternary);
          opacity: 0.8;
        }

        .agent__tags {
          display: flex;
          gap: var(--space-1);
          flex-wrap: wrap;
          margin-top: var(--space-1);
        }

        .agent__tag {
          font-size: 0.7rem;
          padding: 2px 6px;
          background: var(--backgroundTertiary);
          border-radius: 4px;
          color: var(--textSecondary);
          font-weight: 500;
          white-space: nowrap;
        }

        .agent__vision {
          display: flex;
          align-items: center;
          gap: 3px;
          color: var(--primary);
          background: var(--primaryGhost);
          padding-left: 5px;
          padding-right: 7px;
        }

        .agent__tag--more {
          color: var(--primary);
          background: var(--primaryGhost);
        }

        .agent__desc {
          flex: 1;
          font-size: 0.875rem;
          line-height: 1.6;
          color: var(--textSecondary);
          white-space: pre-wrap;
          overflow-y: auto;
          padding: var(--space-2) var(--space-3);
          background: rgba(0, 0, 0, 0.02);
          border-radius: var(--space-2);
        }

        @media (prefers-color-scheme: dark) {
          .agent__desc {
            background: rgba(255, 255, 255, 0.03);
          }
        }

        .agent__desc::-webkit-scrollbar {
          width: 3px;
        }

        .agent__desc::-webkit-scrollbar-thumb {
          background-color: var(--border);
          border-radius: 4px;
        }

        .agent__actions {
          display: flex;
          margin-top: auto;
          padding-top: var(--space-1);
        }

        .agent__primary {
          flex: 1;
        }

        .agent-exit {
          opacity: 0;
          transform: scale(0.95);
          transition: all 0.25s ease;
        }

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
          border: 2px solid rgba(0, 0, 0, 0.1);
          border-top: 2px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .agent__dialog-text {
          color: var(--textSecondary);
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .agent {
            padding: var(--space-4);
          }
          .agent__header {
            padding-right: var(--space-2);
          }
          .agent__more {
            opacity: 1;
          }
          .agent__title-arrow {
            opacity: 1;
            transform: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .agent,
          .agent__title-arrow,
          .agent__more,
          .agent__actions-menu,
          .agent__delete-confirm {
            transition: none;
            animation: none;
          }
          .agent:hover {
            transform: none;
          }
        }
      `}</style>
    </>
  );
};

export default AgentBlock;
