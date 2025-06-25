import { useCallback, useState } from "react";
import { selectTheme } from "app/theme/themeSlice";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { useCouldEdit } from "auth/hooks/useCouldEdit";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { useModal } from "render/ui/Modal";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Avatar from "render/web/ui/Avatar";
import { Agent } from "app/types"; // <-- 重命名类型导入
import { remove } from "database/dbSlice";
import { Dialog } from "render/web/ui/Dialog";
import { Tooltip } from "render/web/ui/Tooltip";
import BotForm from "ai/llm/web/BotForm";
import Button from "render/web/ui/Button";

// Icons
import {
  CommentDiscussionIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowRightIcon,
  SyncIcon,
  PlusIcon,
} from "@primer/octicons-react";
import { FaYenSign } from "react-icons/fa";

interface AgentBlockProps {
  item: Agent; // <-- 使用重命名后的类型
  reload: () => Promise<void>;
}

const AgentBlock = ({ item, reload }: AgentBlockProps) => {
  const { t } = useTranslation("ai");
  const theme = useAppSelector(selectTheme);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const agentKey = item.dbKey || item.id; // <-- 重命名变量
  const { isLoading, createNewDialog } = useCreateDialog();
  const { visible: editVisible, open: openEdit, close: closeEdit } = useModal();
  const [deleting, setDeleting] = useState(false);
  const allowEdit = useCouldEdit(agentKey); // <-- 使用重命名后的变量

  const startDialog = async () => {
    if (isLoading) return;
    try {
      // API参数也建议同步修改为 agents
      await createNewDialog({ agents: [agentKey] });
    } catch (error) {
      toast.error(t("createDialogError"));
    }
  };

  const handleDelete = useCallback(async () => {
    if (deleting) return;
    setDeleting(true);

    try {
      const element = document.getElementById(`agent-${item.id}`); // <-- 重命名 ID
      element?.classList.add("agent-block--exit"); // <-- 重命名 CSS 类
      await new Promise((r) => setTimeout(r, 250));
      await dispatch(remove(agentKey)); // <-- 使用重命名后的变量
      toast.success(t("deleteSuccess"));
      await reload();
    } catch (error) {
      setDeleting(false);
      toast.error(t("deleteError"));
    }
  }, [item.id, agentKey, deleting, dispatch, reload, t]); // <-- 更新依赖项

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/${agentKey}`); // <-- 使用重命名后的变量
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (
      e.target === e.currentTarget ||
      (e.target as Element).classList.contains("agent-block__clickable")
    ) {
      handleViewDetails(e);
    }
  };

  return (
    <>
      <div
        id={`agent-${item.id}`} // <-- 重命名 ID
        className="agent-block" // <-- 重命名 CSS 类
        tabIndex={0}
        onClick={handleCardClick}
        aria-label={`AI助手: ${item.name || t("unnamed")}`}
      >
        {/* 装饰性渐变背景 */}
        <div className="agent-block__bg-gradient" />

        {/* 头部区域 */}
        <div className="agent-block__header">
          <div className="agent-block__avatar-container">
            <Avatar name={item.name} type="agent" size="large" />
            <div className="agent-block__avatar-ring" />
          </div>

          <div className="agent-block__info">
            <div className="agent-block__title-row">
              <div className="agent-block__title-container agent-block__clickable">
                <Tooltip content={`ID: ${item.id}`} placement="top">
                  <h3 className="agent-block__title">
                    {item.name || t("unnamed")}
                  </h3>
                </Tooltip>

                <Tooltip content={t("viewDetails")} placement="top">
                  <button
                    className="agent-block__view-link"
                    onClick={handleViewDetails}
                    aria-label={t("viewDetails")}
                  >
                    <ArrowRightIcon size={14} />
                  </button>
                </Tooltip>
              </div>

              {/* Meta信息 */}
              <div className="agent-block__meta">
                {item.outputPrice && (
                  <div className="agent-block__price-tag">
                    <FaYenSign size={10} />
                    <span>{(item.outputPrice || 0).toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 标签区域 */}
            <div className="agent-block__tags">
              {item.hasVision && (
                <Tooltip content={t("hasVision")} placement="top">
                  <span className="agent-block__tag agent-block__vision-tag">
                    <EyeIcon size={11} />
                    <span>{t("vision")}</span>
                  </span>
                </Tooltip>
              )}
              {item.tags?.slice(0, 3).map((tag, index) => (
                <span key={index} className="agent-block__tag">
                  {tag}
                </span>
              ))}
              {item.tags && item.tags.length > 3 && (
                <span className="agent-block__tag agent-block__more-tag">
                  +{item.tags.length - 3}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 描述区域 */}
        <div className="agent-block__description agent-block__clickable">
          {item.introduction || t("noDescription")}
        </div>

        {/* 操作区域 */}
        <div className="agent-block__actions">
          <Button
            icon={<CommentDiscussionIcon size={16} />}
            onClick={startDialog}
            disabled={isLoading}
            loading={isLoading}
            size="medium"
            className="agent-block__primary-action"
          >
            {isLoading ? t("starting") : t("startChat")}
          </Button>

          {allowEdit && (
            <div className="agent-block__secondary-actions">
              <Button
                icon={<PencilIcon size={14} />}
                onClick={openEdit}
                variant="secondary"
                size="medium"
                aria-label={t("edit")}
              />
              <Button
                icon={<TrashIcon size={14} />}
                onClick={handleDelete}
                disabled={deleting}
                loading={deleting}
                variant="danger"
                size="medium"
                aria-label={t("delete")}
              />
            </div>
          )}
        </div>

        {/* 悬停指示器 */}
        <div className="agent-block__hover-indicator" />
      </div>

      {/* 编辑对话框 */}
      {editVisible && (
        <Dialog
          isOpen={editVisible}
          onClose={closeEdit}
          title={`${t("edit")} ${item.name || t("agent")}`} // <-- 更新翻译占位符
          size="large"
        >
          <BotForm
            mode="edit"
            initialValues={item}
            onClose={closeEdit}
            CreateIcon={PlusIcon}
            EditIcon={SyncIcon}
          />
        </Dialog>
      )}

      {/* 关键：重命名 style href */}
      <style href="agent-block" precedence="medium">{`
        .agent-block {
          background: ${theme.background};
          border-radius: 20px;
          padding: ${theme.space[6]};
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: ${theme.space[4]};
          border: 1px solid ${theme.border};
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          outline: none;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          box-shadow: 
            0 2px 8px ${theme.shadow1},
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .agent-block__bg-gradient {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 60%;
          background: linear-gradient(135deg, ${theme.primary}04 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }

        .agent-block:hover .agent-block__bg-gradient {
          opacity: 1;
        }

        .agent-block:hover {
          transform: translateY(-6px) scale(1.01);
          border-color: ${theme.primary}30;
          box-shadow: 
            0 20px 40px -8px ${theme.shadow2},
            0 0 0 1px ${theme.primary}15,
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
        }

        .agent-block:focus-visible {
          border-color: ${theme.primary};
          box-shadow: 
            0 0 0 2px ${theme.background},
            0 0 0 4px ${theme.primary},
            0 2px 8px ${theme.shadow1};
        }

        .agent-block__header {
          display: flex;
          gap: ${theme.space[4]};
          align-items: flex-start;
          position: relative;
          z-index: 1;
        }

        .agent-block__avatar-container {
          position: relative;
          flex-shrink: 0;
        }

        .agent-block__avatar-ring {
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${theme.primary}20 0%, transparent 50%);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
        }

        .agent-block:hover .agent-block__avatar-ring {
          opacity: 1;
        }

        .agent-block__info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: ${theme.space[3]};
        }

        .agent-block__title-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: ${theme.space[3]};
        }

        .agent-block__title-container {
          min-width: 0;
          flex: 1;
          display: flex;
          align-items: center;
          gap: ${theme.space[2]};
        }

        .agent-block__title {
          font-size: 1.125rem;
          font-weight: 650;
          margin: 0;
          color: ${theme.text};
          word-break: break-word;
          letter-spacing: -0.02em;
          line-height: 1.3;
          flex: 1;
          min-width: 0;
          transition: color 0.3s ease;
        }

        .agent-block:hover .agent-block__title {
          color: ${theme.primary};
        }

        .agent-block__view-link {
          background: none;
          border: none;
          color: ${theme.textTertiary};
          cursor: pointer;
          padding: ${theme.space[1]};
          border-radius: ${theme.space[2]};
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: translateX(-8px);
          flex-shrink: 0;
        }

        .agent-block:hover .agent-block__view-link {
          opacity: 1;
          transform: translateX(0);
        }

        .agent-block__view-link:hover {
          color: ${theme.primary};
          background: ${theme.primary}12;
          transform: translateX(3px);
        }

        .agent-block__view-link:focus-visible {
          opacity: 1;
          outline: none;
          box-shadow: 0 0 0 2px ${theme.primary}40;
          color: ${theme.primary};
        }

        .agent-block__meta {
          display: flex;
          align-items: flex-start;
          gap: ${theme.space[2]};
          flex-shrink: 0;
        }

        .agent-block__price-tag {
          font-size: 0.75rem;
          color: ${theme.textTertiary};
          padding: ${theme.space[1]} ${theme.space[2]};
          background: ${theme.backgroundTertiary};
          border-radius: ${theme.space[2]};
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 550;
          font-variant-numeric: tabular-nums;
          border: 1px solid ${theme.borderLight};
          transition: all 0.3s ease;
        }

        .agent-block:hover .agent-block__price-tag {
          background: ${theme.primary}10;
          border-color: ${theme.primary}20;
          color: ${theme.primary};
        }

        .agent-block__tags {
          display: flex;
          gap: ${theme.space[1]};
          flex-wrap: wrap;
          align-items: center;
        }

        .agent-block__tag {
          font-size: 0.75rem;
          color: ${theme.textTertiary};
          padding: ${theme.space[1]} ${theme.space[2]};
          background: ${theme.backgroundTertiary};
          border-radius: ${theme.space[2]};
          white-space: nowrap;
          font-weight: 520;
          border: 1px solid ${theme.borderLight};
          transition: all 0.3s ease;
        }

        .agent-block__vision-tag {
          display: flex;
          align-items: center;
          gap: 4px;
          color: ${theme.primary};
          background: ${theme.primary}12;
          border-color: ${theme.primary}25;
        }

        .agent-block__more-tag {
          color: ${theme.primary};
          background: ${theme.primary}08;
          border-color: ${theme.primary}20;
          font-weight: 600;
        }

        .agent-block:hover .agent-block__tag {
          background: ${theme.backgroundSelected || theme.backgroundHover};
          border-color: ${theme.border};
        }

        .agent-block__description {
          flex: 1;
          font-size: 0.9rem;
          line-height: 1.6;
          color: ${theme.textSecondary};
          margin: ${theme.space[2]} 0;
          overflow-wrap: break-word;
          white-space: pre-line;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          position: relative;
          z-index: 1;
          letter-spacing: -0.01em;
        }

        .agent-block__actions {
          display: flex;
          gap: ${theme.space[2]};
          margin-top: auto;
          padding-top: ${theme.space[3]};
          position: relative;
          z-index: 2;
        }

        .agent-block__primary-action {
          flex: 1;
        }

        .agent-block__secondary-actions {
          display: flex;
          gap: ${theme.space[1]};
          flex-shrink: 0;
        }

        .agent-block__hover-indicator {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, ${theme.primary} 0%, ${theme.primary}60 100%);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .agent-block:hover .agent-block__hover-indicator {
          transform: scaleX(1);
        }

        .agent-block--exit {
          opacity: 0;
          transform: scale(0.95) translateY(20px);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* 响应式设计 */
        @media (max-width: 768px) {
          .agent-block {
            padding: ${theme.space[5]};
          }

          .agent-block__view-link {
            opacity: 1;
            transform: translateX(0);
          }

          .agent-block:hover {
            transform: translateY(-3px) scale(1.005);
          }

          .agent-block__title {
            font-size: 1rem;
          }
        }

        @media (max-width: 480px) {
          .agent-block {
            padding: ${theme.space[4]};
            gap: ${theme.space[3]};
            border-radius: 16px;
          }

          .agent-block__actions {
            flex-direction: column;
            gap: ${theme.space[2]};
          }

          .agent-block__secondary-actions {
            justify-content: stretch;
          }

          .agent-block__secondary-actions > * {
            flex: 1;
          }

          .agent-block__tags {
            gap: 6px;
          }

          .agent-block__tag {
            font-size: 0.7rem;
            padding: 4px 8px;
          }
        }

        /* 性能优化 */
        @media (prefers-reduced-motion: reduce) {
          .agent-block,
          .agent-block__bg-gradient,
          .agent-block__avatar-ring,
          .agent-block__view-link,
          .agent-block__hover-indicator,
          .agent-block__price-tag,
          .agent-block__tag,
          .agent-block__title {
            transition: none;
          }
          
          .agent-block:hover {
            transform: none;
          }
          
          .agent-block--exit {
            transition: none;
          }
        }

        /* 高对比度支持 */
        @media (prefers-contrast: high) {
          .agent-block {
            border-width: 2px;
          }
          
          .agent-block__tag,
          .agent-block__price-tag {
            border-width: 2px;
          }
        }
      `}</style>
    </>
  );
};

export default AgentBlock;
