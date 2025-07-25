import { useCallback, useState } from "react";
// 1. 从 react-router-dom 导入 Link
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
  LuPencil,
  LuPlus,
  LuRefreshCw,
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
  const [deleting, setDeleting] = useState(false);
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
  }, [item.id, agentKey, deleting, dispatch, reload, t]);

  // handleViewDetails 仍然保留，用于整个卡片的点击跳转
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
        {/* Header */}
        <div className="agent__header">
          <div className="agent__avatar">
            <Avatar name={item.name} type="agent" size="large" />
          </div>

          <div className="agent__info">
            <div className="agent__title-row">
              {/* 2. 使用 Link 组件包裹标题和箭头 */}
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
                <span className="agent__tag agent__more">
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

          {allowEdit && (
            <div className="agent__secondary">
              <Button
                icon={<LuPencil size={14} />}
                onClick={openEdit}
                variant="secondary"
                size="medium"
              />
              <Button
                icon={<LuTrash2 size={14} />}
                onClick={handleDelete}
                disabled={deleting}
                loading={deleting}
                variant="danger"
                size="medium"
              />
            </div>
          )}
        </div>
      </div>

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

      <style href="agent-block" precedence="medium">{`
        .agent {
          background: var(--background);
          border-radius: var(--space-4);
          padding: var(--space-5);
          border: 1px solid var(--border);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
          height: 100%;
        }

        .agent:hover {
          transform: translateY(-2px);
          border-color: var(--borderAccent, var(--primary));
          box-shadow: 
            0 4px 12px var(--shadowLight),
            0 2px 4px var(--shadowMedium);
        }

        .agent:active {
          transform: translateY(0);
        }

        .agent__header {
          display: flex;
          gap: var(--space-3);
          align-items: flex-start;
        }

        .agent__avatar {
          flex-shrink: 0;
        }

        .agent__info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .agent__title-row {
          display: flex;
          align-items: flex-start;
        }

        .agent__title-link {
          /* Reset Link/Button Styles */
          background: none;
          border: none;
          padding: 0;
          margin: 0;
          font: inherit;
          text-align: left;
          color: inherit;
          cursor: pointer;
          text-decoration: none; /* 3. 确保移除a标签的下划线 */
          
          /* Layout */
          display: flex;
          align-items: center;
          gap: var(--space-2);
          flex: 1;
          min-width: 0;
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

        .agent:hover .agent__title,
        .agent__title-link:hover .agent__title {
          color: var(--primary);
        }

        .agent__title-arrow {
          background: none;
          border: none;
          color: var(--textTertiary);
          padding: var(--space-1);
          border-radius: var(--space-1);
          transition: all 0.2s ease;
          opacity: 0;
          transform: translateX(-4px);
          flex-shrink: 0;
          display: flex;
          align-items: center;
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
          font-weight: 400;
          align-self: flex-start;
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
          background: var(--primaryGhost, var(--focus));
        }

        .agent__more {
          color: var(--primary);
          background: var(--primaryGhost, var(--focus));
        }

        .agent__desc {
          flex: 1;
          font-size: 0.9rem;
          line-height: 1.5;
          color: var(--textSecondary);
          white-space: pre-wrap;
          overflow-y: auto;
          max-height: 90px; /* Limit height (approx 4 lines) */
          padding: var(--space-2) var(--space-3);
          background: var(--backgroundSecondary);
          border-radius: var(--space-2);
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }
        
        .agent__desc::-webkit-scrollbar {
          width: 4px;
        }
        
        .agent__desc::-webkit-scrollbar-track {
          background: transparent;
        }

        .agent__desc::-webkit-scrollbar-thumb {
          background-color: var(--border);
          border-radius: 4px;
        }

        .agent__actions {
          display: flex;
          gap: var(--space-2);
          margin-top: auto;
        }

        .agent__primary {
          flex: 1;
        }

        .agent__secondary {
          display: flex;
          gap: var(--space-1);
        }

        .agent-exit {
          opacity: 0;
          transform: scale(0.95);
          transition: all 0.25s ease;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .agent {
            padding: var(--space-4);
            gap: var(--space-3);
          }
          .agent__title-arrow {
            opacity: 1;
            transform: none;
            position: absolute;
            top: var(--space-2);
            right: var(--space-2);
          }
           .agent__title-link {
            position: static;
          }
        }
        
        @media (hover: none) and (pointer: coarse) {
          .agent:hover {
            transform: none;
          }
          .agent__title-arrow {
            opacity: 1;
            transform: none;
          }
          .agent:active {
            transform: scale(0.98);
            background: var(--backgroundHover);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .agent,
          .agent__title-arrow,
          .agent-exit {
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
