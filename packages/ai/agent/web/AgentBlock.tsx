import { useCallback, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useAppDispatch } from "app/store";
import { remove } from "database/dbSlice";
import { Agent } from "app/types";
import { useCouldEdit } from "auth/hooks/useCouldEdit";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { useModal } from "render/ui/Modal";

// UI Components
import Avatar from "render/web/ui/Avatar";
import Button from "render/web/ui/Button";
import { Dialog } from "render/web/ui/Dialog";
import AgentForm from "ai/llm/web/AgentForm";

// Icons from Lucide
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
} from "react-icons/lu";

interface AgentBlockProps {
  item: Agent;
  reload: () => Promise<void>;
}

const AgentBlock = ({ item, reload }: AgentBlockProps) => {
  const { t } = useTranslation("ai");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const agentKey = item.dbKey || item.id;
  const { isLoading, createNewDialog } = useCreateDialog();
  const { visible: editVisible, open: openEdit, close: closeEdit } = useModal();
  const { visible: moreVisible, open: openMore, close: closeMore } = useModal();
  const [deleting, setDeleting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const allowEdit = useCouldEdit(agentKey);

  const startDialog = async () => {
    if (isLoading) return;
    try {
      await createNewDialog({ agents: [agentKey] });
    } catch (error) {
      toast.error(t("createDialogError"));
    }
  };

  const handleDelete = useCallback(async () => {
    if (deleting) return;
    setDeleting(true);
    closeMore();

    try {
      const element = document.getElementById(`agent-${item.id}`);
      element?.classList.add("agent-exit");
      await new Promise((r) => setTimeout(r, 250));
      await dispatch(remove(agentKey));
      toast.success(t("deleteSuccess"));
      await reload();
    } catch (error) {
      setDeleting(false);
      toast.error(t("deleteError"));
    }
  }, [item.id, agentKey, deleting, dispatch, reload, t, closeMore]);

  const handleEdit = useCallback(() => {
    closeMore();
    openEdit();
  }, [closeMore, openEdit]);

  const handleToggleFavorite = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsFavorite(!isFavorite);
      toast.success(
        isFavorite ? t("removedFromFavorites") : t("addedToFavorites")
      );
    },
    [isFavorite, t]
  );

  const handleMoreClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      openMore();
    },
    [openMore]
  );

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/${agentKey}`);
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
              className="agent__more"
              onClick={handleMoreClick}
              title={t("moreActions")}
            >
              <LuEllipsis size={18} />
            </button>
          )}
        </div>

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
            disabled={isLoading}
            loading={isLoading}
            size="medium"
            className="agent__primary"
          >
            {isLoading ? t("starting") : t("startChat")}
          </Button>
        </div>
      </div>

      {/* 编辑对话框 */}
      {editVisible && (
        <Dialog
          isOpen={editVisible}
          onClose={closeEdit}
          title={`${t("edit")} ${item.name || t("agent")}`}
          size="large"
        >
          <AgentForm
            mode="edit"
            initialValues={item}
            onClose={closeEdit}
            CreateIcon={LuPlus}
            EditIcon={LuRefreshCw}
          />
        </Dialog>
      )}

      {/* 更多操作对话框 */}
      {moreVisible && allowEdit && (
        <Dialog
          isOpen={moreVisible}
          onClose={closeMore}
          title={t("moreActions")}
          size="small"
        >
          <div className="agent__more-menu">
            <Button
              icon={<LuPencil size={16} />}
              onClick={handleEdit}
              variant="secondary"
              size="medium"
              className="agent__more-item"
            >
              {t("edit")}
            </Button>
            <Button
              icon={<LuTrash2 size={16} />}
              onClick={handleDelete}
              disabled={deleting}
              loading={deleting}
              variant="danger"
              size="medium"
              className="agent__more-item"
            >
              {deleting ? t("deleting") : t("delete")}
            </Button>
          </div>
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
        }

        .agent:hover {
          transform: translateY(-1px);
          border-color: var(--primary);
          box-shadow: 0 4px 12px var(--shadowLight);
        }

        /* 右上角操作按钮 - 去掉边框，增大尺寸 */
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

        .agent__more:hover {
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

        .agent__header {
          display: flex;
          gap: var(--space-3);
          align-items: flex-start;
          padding-right: var(--space-12); /* 减少右侧留白 */
        }

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

        .agent:hover .agent__title {
          color: var(--primary);
        }

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

        .agent__tags {
          display: flex;
          gap: var(--space-1);
          flex-wrap: wrap;
        }

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

        .agent__tag--more {
          color: var(--primary);
          background: var(--primaryGhost);
        }

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
        
        .agent__desc::-webkit-scrollbar {
          width: 4px;
        }
        
        .agent__desc::-webkit-scrollbar-thumb {
          background-color: var(--border);
          border-radius: 4px;
        }

        .agent__actions {
          display: flex;
          margin-top: auto;
        }

        .agent__primary {
          flex: 1;
        }

        .agent__more-menu {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          padding: var(--space-4);
        }

        .agent__more-item {
          justify-content: flex-start;
        }

        .agent-exit {
          opacity: 0;
          transform: scale(0.95);
          transition: all 0.25s ease;
        }

        /* 移动端 */
        @media (max-width: 768px) {
          .agent {
            padding: var(--space-4);
          }
          
          .agent__top-actions {
            top: var(--space-3);
            right: var(--space-3);
          }
          
          .agent__header {
            padding-right: var(--space-10);
          }
          
          .agent__favorite,
          .agent__more {
            width: 32px;
            height: 32px;
          }
          
          .agent__title-arrow {
            opacity: 1;
            transform: none;
          }
          
          .agent__favorite,
          .agent__more {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .agent,
          .agent__title-arrow,
          .agent__favorite,
          .agent__more {
            transition: none;
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
