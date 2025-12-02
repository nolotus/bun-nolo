import {
  useCallback,
  useEffect,
  useState,
  lazy,
  Suspense,
  useRef,
} from "react";
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

// 确认这些图标存在于 react-icons/lu
import {
  LuArrowRight,
  LuCoins,
  LuEye,
  LuMessageSquare,
  LuEllipsis, // 如果报错，尝试改为 LuMoreHorizontal
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

const loadAgentForm = () => import("ai/llm/web/AgentForm");
const AgentFormLazy = lazy(loadAgentForm);

const preloadEditBundle = () => {
  loadAgentForm();
};

const AgentBlock = ({ item, reload }: AgentBlockProps) => {
  const { t } = useTranslation("ai");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  // 使用 ref 引用 DOM，替代 getElementById
  const cardRef = useRef<HTMLDivElement>(null);

  const agentKey = item.dbKey || item.id;
  const { isLoading, createNewDialog } = useCreateDialog();
  const { visible: editVisible, open: openEdit, close: closeEdit } = useModal();
  const [showActions, setShowActions] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const allowEdit = useCouldEdit(agentKey);

  const startDialog = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
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
      // 使用 ref 添加退出动画类
      if (cardRef.current) {
        cardRef.current.classList.add("agent-exit");
      }

      // 等待动画
      await new Promise((r) => setTimeout(r, 250));

      await dispatch(remove(agentKey));
      toast.success(t("deleteSuccess"));
      await reload();
    } catch (err) {
      console.error(err);
      setDeleting(false);
      setConfirmingDelete(false);
      // 移除动画类以恢复显示
      if (cardRef.current) {
        cardRef.current.classList.remove("agent-exit");
      }
      toast.error(t("deleteError"));
    }
  }, [item.id, agentKey, deleting, dispatch, reload, t]);

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowActions(false);
      preloadEditBundle();
      openEdit();
    },
    [openEdit]
  );

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
      if (next) preloadEditBundle();
    },
    [showActions]
  );

  // 点击卡片主体跳转
  const handleCardClick = (e: React.MouseEvent) => {
    // 只有当点击的目标不是按钮或链接时才跳转
    const target = e.target as HTMLElement;
    const isInteractive = target.closest("button") || target.closest("a");

    if (!isInteractive && !confirmingDelete) {
      navigate(`/${agentKey}`);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmingDelete(true);
    setShowActions(false);
  };

  return (
    <>
      <div ref={cardRef} className="agent" onClick={handleCardClick}>
        {/* Top Actions */}
        <div className="agent__top-actions">
          <button
            className={`agent__icon-btn ${isFavorite ? "active" : ""}`}
            onClick={handleToggleFavorite}
            title={isFavorite ? t("removeFromFavorites") : t("addToFavorites")}
          >
            <LuStar size={16} className={isFavorite ? "fill-current" : ""} />
          </button>

          {allowEdit && (
            <button
              className={`agent__icon-btn ${showActions ? "active" : ""}`}
              onPointerEnter={preloadEditBundle}
              onClick={handleMoreClick}
            >
              <LuEllipsis size={16} />
            </button>
          )}
        </div>

        {/* Menu */}
        {showActions && allowEdit && (
          <div className="agent__menu">
            <button className="agent__menu-item" onClick={handleEdit}>
              <LuPencil size={14} />
              <span>{t("edit")}</span>
            </button>
            <button
              className="agent__menu-item delete"
              onClick={handleDeleteClick}
            >
              <LuTrash2 size={14} />
              <span>{t("delete")}</span>
            </button>
          </div>
        )}

        {/* Delete Overlay */}
        {confirmingDelete && (
          <div
            className="agent__confirm-overlay"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="agent__confirm-text">{t("confirmDelete")}</span>
            <div className="agent__confirm-actions">
              <button
                className="agent__confirm-btn cancel"
                onClick={() => setConfirmingDelete(false)}
              >
                <LuX size={14} />
              </button>
              <button
                className="agent__confirm-btn confirm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <div className="spinner-sm" />
                ) : (
                  <LuCheck size={14} />
                )}
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="agent__content">
          <div className="agent__header">
            <Avatar
              name={item.name}
              type="agent"
              size="large"
              className="agent__avatar-img"
            />
            <div className="agent__header-info">
              <Link
                to={`/${agentKey}`}
                className="agent__title-group"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="agent__title">{item.name || t("unnamed")}</h3>
                <LuArrowRight className="agent__arrow" size={14} />
              </Link>

              <div className="agent__meta-row">
                {item.outputPrice ? (
                  <div className="agent__meta-item">
                    <LuCoins size={12} />
                    <span>{item.outputPrice.toFixed(2)}</span>
                  </div>
                ) : null}
                {item.hasVision && (
                  <div className="agent__meta-item highlight">
                    <LuEye size={12} />
                    <span>{t("vision")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="agent__desc">
            {item.introduction || t("noDescription")}
          </div>

          <div className="agent__footer">
            <div className="agent__tags-scroll">
              {item.tags?.map((tag, i) => (
                <span key={i} className="agent__tag">
                  {tag}
                </span>
              ))}
            </div>

            <div className="agent__action-area">
              <Button
                icon={<LuMessageSquare size={16} />}
                onClick={startDialog}
                disabled={isLoading || confirmingDelete}
                loading={isLoading}
                size="medium"
                className="agent__start-btn"
              >
                {isLoading ? t("starting") : t("startChat")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {editVisible && (
        <Dialog
          isOpen={editVisible}
          onClose={closeEdit}
          title={`${t("edit")} ${item.name}`}
          size="large"
        >
          <Suspense
            fallback={
              <div className="p-8 text-center text-textSecondary">
                {t("loading")}
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

      {/* 样式保持原样，省略以节省空间，直接使用之前提供的 style 块即可 */}
      <style href="agent-block" precedence="medium">{`
        :root {
           --agent-bg: var(--background);
           --agent-border: rgba(0, 0, 0, 0.06);
           --agent-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
           --agent-shadow-hover: 0 8px 24px rgba(0, 0, 0, 0.08), 0 0 0 1px var(--primary-alpha-10);
           --agent-radius: 16px;
           --transition-smooth: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        .dark {
           --agent-border: rgba(255, 255, 255, 0.08);
           --agent-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
           --agent-shadow-hover: 0 8px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px var(--primary-alpha-20);
        }

        .agent {
          position: relative;
          background: var(--agent-bg);
          border-radius: var(--agent-radius);
          border: 1px solid var(--agent-border);
          box-shadow: var(--agent-shadow);
          padding: 20px;
          display: flex;
          flex-direction: column;
          height: 100%;
          transition: var(--transition-smooth);
          cursor: default;
          overflow: hidden;
        }

        .agent:hover {
          transform: translateY(-4px);
          box-shadow: var(--agent-shadow-hover);
          border-color: transparent;
        }

        .agent-exit {
          opacity: 0;
          transform: scale(0.9);
          transition: var(--transition-smooth);
        }

        .agent__top-actions {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          gap: 4px;
          z-index: 10;
          opacity: 0;
          transform: translateY(-4px);
          transition: var(--transition-smooth);
        }

        .agent:hover .agent__top-actions,
        .agent__top-actions:has(.active) {
          opacity: 1;
          transform: translateY(0);
        }

        .agent__icon-btn {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: none;
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(4px);
          color: var(--textTertiary);
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }
        
        .dark .agent__icon-btn { background: rgba(0,0,0,0.4); }

        .agent__icon-btn:hover {
          background: var(--background);
          color: var(--text);
          transform: scale(1.05);
        }

        .agent__icon-btn.active {
          color: var(--warning);
        }
        .fill-current { fill: currentColor; }

        .agent__menu {
          position: absolute;
          top: 44px;
          right: 12px;
          background: var(--background);
          border: 1px solid var(--border);
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
          border-radius: 12px;
          padding: 4px;
          z-index: 20;
          min-width: 100px;
          animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          transform-origin: top right;
        }

        @keyframes scaleIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }

        .agent__menu-item {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 8px 12px;
          border: none;
          background: transparent;
          color: var(--textSecondary);
          font-size: 0.85rem;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s;
          text-align: left;
        }

        .agent__menu-item:hover { background: var(--backgroundHover); color: var(--text); }
        .agent__menu-item.delete:hover { background: var(--errorBg); color: var(--error); }

        .agent__confirm-overlay {
            position: absolute;
            inset: 0;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(2px);
            z-index: 15;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 12px;
            animation: fadeIn 0.2s ease;
        }
        .dark .agent__confirm-overlay { background: rgba(0,0,0,0.8); }

        .agent__confirm-text { font-weight: 500; font-size: 0.9rem; color: var(--text); }
        .agent__confirm-actions { display: flex; gap: 8px; }
        .agent__confirm-btn {
            width: 32px; height: 32px;
            border-radius: 50%;
            border: 1px solid var(--border);
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
            background: var(--background);
        }
        .agent__confirm-btn.confirm { background: var(--error); color: white; border-color: var(--error); }
        .agent__confirm-btn:hover { transform: scale(1.1); }
        
        .spinner-sm {
            width: 12px; height: 12px;
            border: 2px solid rgba(255,255,255,0.3); border-top-color: white;
            border-radius: 50%; animation: spin 1s linear infinite;
        }

        .agent__content {
            display: flex;
            flex-direction: column;
            height: 100%;
            gap: 16px;
        }

        .agent__header {
            display: flex;
            gap: 16px;
            align-items: flex-start;
        }

        .agent__header-info {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 4px;
            padding-top: 2px;
        }

        .agent__title-group {
            display: flex;
            align-items: center;
            gap: 6px;
            text-decoration: none;
            color: var(--text);
            width: fit-content;
            cursor: pointer;
        }

        .agent__title {
            margin: 0;
            font-size: 1.05rem;
            font-weight: 600;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
            letter-spacing: -0.01em;
        }
        
        .agent__arrow {
            opacity: 0;
            transform: translateX(-4px);
            transition: all 0.2s ease;
            color: var(--primary);
        }
        
        .agent__title-group:hover .agent__title { color: var(--primary); }
        .agent:hover .agent__arrow { opacity: 1; transform: translateX(0); }

        .agent__meta-row {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 0.75rem;
            color: var(--textQuaternary);
        }

        .agent__meta-item {
            display: flex;
            align-items: center;
            gap: 4px;
            background: var(--backgroundSecondary);
            padding: 2px 6px;
            border-radius: 4px;
        }
        
        .agent__meta-item.highlight {
            color: var(--primary);
            background: var(--primaryGhost);
        }

        .agent__desc {
            flex: 1;
            font-size: 0.875rem;
            line-height: 1.6;
            color: var(--textSecondary);
            background: transparent; 
            padding: 0;
            margin: 0;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            cursor: pointer;
            transition: color 0.2s;
        }
        
        .agent__desc:hover { color: var(--text); }

        .agent__footer {
            margin-top: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .agent__tags-scroll {
            display: flex;
            gap: 6px;
            overflow-x: auto;
            padding-bottom: 4px;
            scrollbar-width: none; 
            -ms-overflow-style: none;
            mask-image: linear-gradient(to right, black 90%, transparent 100%);
        }
        .agent__tags-scroll::-webkit-scrollbar { display: none; }

        .agent__tag {
            font-size: 0.75rem;
            color: var(--textTertiary);
            background: var(--backgroundSecondary);
            padding: 3px 8px;
            border-radius: 6px;
            white-space: nowrap;
            border: 1px solid transparent;
            transition: all 0.2s;
        }
        
        .agent:hover .agent__tag {
            background: var(--backgroundTertiary);
        }

        .agent__start-btn {
            width: 100%;
            justify-content: center;
            background: linear-gradient(180deg, var(--primary) 0%, var(--primary-dark-10, #2563eb) 100%);
            box-shadow: 0 2px 4px rgba(var(--primary-rgb), 0.2);
            border: none;
            font-weight: 500;
            letter-spacing: 0.02em;
            transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        
        .agent__start-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(var(--primary-rgb), 0.3);
        }
        
        .agent__start-btn:active {
            transform: translateY(1px);
            box-shadow: 0 1px 2px rgba(var(--primary-rgb), 0.2);
        }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </>
  );
};

export default AgentBlock;
