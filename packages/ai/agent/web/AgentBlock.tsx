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
  LuPlus,
  LuRefreshCw,
} from "react-icons/lu";

// 懒加载 More Actions 组件（包含更多菜单 + 删除 ConfirmModal）
const AgentMoreActionsLazy = lazy(() => import("./AgentMoreActions"));

interface AgentBlockProps {
  item: Agent;
  reload: () => Promise<void>;
}

const loadAgentForm = () => import("ai/agent/web/AgentForm");
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

  // 仅负责“真正删除”的逻辑，不负责任何 UI 状态（modal/loading 等）
  const handleDelete = useCallback(async () => {
    try {
      const element = document.getElementById(`agent-${item.id}`);
      element?.classList.add("agent-exit");

      await new Promise((r) => setTimeout(r, 250));
      await dispatch(remove(agentKey));

      toast.success(t("deleteSuccess"));
      await reload();
    } catch {
      toast.error(t("deleteError"));
      // 注意：AgentMoreActions 内部也会把 loading 置回 false
    }
  }, [item.id, agentKey, dispatch, reload, t]);

  // 打开编辑弹窗
  const handleEdit = useCallback(() => {
    preloadEditBundle();
    openEdit();
  }, [openEdit]);

  const handleViewDetails = (e: React.MouseEvent) => {
    stopEvent(e);
    navigate(`/${agentKey}`);
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
        {/* 只有有编辑权限时，才懒加载 More Actions（包含更多菜单 + 删除确认） */}
        {allowEdit && (
          <Suspense fallback={null}>
            <AgentMoreActionsLazy
              preloadEditBundle={preloadEditBundle}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Suspense>
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
            disabled={isLoading}
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
          --agent-card-height: 220px;
          --agent-glass-blur: blur(10px) saturate(1.1);

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
            0 0 0 1px var(--borderLight),
            0 4px 12px -2px var(--shadowLight),
            0 12px 32px -4px var(--shadowMedium);

          backdrop-filter: var(--agent-glass-blur);
          -webkit-backdrop-filter: var(--agent-glass-blur);
        }

        .agent:hover {
          transform: translateY(-4px);
          box-shadow:
            0 0 0 1px var(--primaryGhost),
            0 4px 12px -2px var(--shadowLight),
            0 12px 32px -4px var(--shadowMedium),
            0 18px 48px -8px var(--shadowMedium);
        }

        .agent__header {
          display: flex;
          gap: var(--space-3);
          align-items: flex-start;
          padding-right: var(--space-8);
          margin-top: var(--space-1);
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
          background: var(--backgroundSecondary);
          border-radius: var(--space-2);
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
          border: 2px solid var(--border);
          border-top: 2px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
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
          .agent__title-arrow {
            opacity: 1;
            transform: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .agent,
          .agent__title-arrow {
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
