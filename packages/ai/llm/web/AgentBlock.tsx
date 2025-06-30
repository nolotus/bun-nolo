import { useCallback, useState } from "react";
import { selectTheme } from "app/settings/settingSlice";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "app/store";
import { useCouldEdit } from "auth/hooks/useCouldEdit";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { useModal } from "render/ui/Modal";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Avatar from "render/web/ui/Avatar";
import { Agent } from "app/types";
import { remove } from "database/dbSlice";
import { Dialog } from "render/web/ui/Dialog";
import { Tooltip } from "render/web/ui/Tooltip";
import AgentForm from "ai/llm/web/AgentForm";
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
  item: Agent;
  reload: () => Promise<void>;
}

const AgentBlock = ({ item, reload }: AgentBlockProps) => {
  const { t } = useTranslation("ai");
  const theme = useAppSelector(selectTheme);
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
            (e.target as Element).className.includes("clickable")
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
              <div className="agent__title-container clickable">
                <h3 className="agent__title">{item.name || t("unnamed")}</h3>
                <button onClick={handleViewDetails} className="agent__view-btn">
                  <ArrowRightIcon size={14} />
                </button>
              </div>

              {item.outputPrice && (
                <div className="agent__price">
                  <FaYenSign size={10} />
                  <span>{item.outputPrice.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="agent__tags">
              {item.hasVision && (
                <span className="agent__tag agent__vision">
                  <EyeIcon size={11} />
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
            icon={<CommentDiscussionIcon size={16} />}
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
                icon={<PencilIcon size={14} />}
                onClick={openEdit}
                variant="secondary"
                size="medium"
              />
              <Button
                icon={<TrashIcon size={14} />}
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
            CreateIcon={PlusIcon}
            EditIcon={SyncIcon}
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
          justify-content: space-between;
          gap: var(--space-2);
        }

        .agent__title-container {
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
        }

        .agent:hover .agent__title {
          color: var(--primary);
        }

        .agent__view-btn {
          background: none;
          border: none;
          color: var(--textTertiary);
          padding: var(--space-1);
          border-radius: var(--space-1);
          cursor: pointer;
          transition: all 0.2s ease;
          opacity: 0;
          flex-shrink: 0;
        }

        .agent:hover .agent__view-btn {
          opacity: 1;
          color: var(--primary);
        }

        .agent__price {
          font-size: 0.75rem;
          color: var(--textTertiary);
          padding: var(--space-1) var(--space-2);
          background: var(--backgroundTertiary);
          border-radius: var(--space-1);
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 550;
          flex-shrink: 0;
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
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
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

        /* 响应式设计 - 移动端优化 */
        @media (max-width: 768px) {
          .agent {
            padding: var(--space-4);
            gap: var(--space-3);
          }

          .agent__header {
            gap: var(--space-2);
          }

          .agent__info {
            gap: var(--space-1);
          }

          .agent__title-row {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-1);
          }

          .agent__title-container {
            width: 100%;
          }

          .agent__view-btn {
            opacity: 1;
            position: absolute;
            top: var(--space-2);
            right: var(--space-2);
          }

          .agent__price {
            align-self: flex-start;
          }

          .agent__tags {
            gap: var(--space-1);
          }

          .agent__actions {
            gap: var(--space-2);
          }

          .agent__secondary {
            gap: var(--space-1);
          }

          /* 移动端更小的屏幕 */
          @media (max-width: 480px) {
            .agent {
              padding: var(--space-3);
            }

            .agent__actions {
              flex-direction: column;
              gap: var(--space-2);
            }

            .agent__secondary {
              justify-content: center;
            }

            .agent__title {
              font-size: 1rem;
            }
          }
        }

        /* 触屏设备优化 */
        @media (hover: none) and (pointer: coarse) {
          .agent {
            /* 移除hover效果，使用touch反馈 */
            touch-action: manipulation;
          }

          .agent:hover {
            transform: none;
          }

          .agent__view-btn {
            opacity: 1;
          }

          .agent:active {
            transform: scale(0.98);
            background: var(--backgroundHover);
          }
        }

        /* 高对比度模式支持 */
        @media (prefers-contrast: high) {
          .agent {
            border-width: 2px;
          }

          .agent__tag,
          .agent__price {
            border: 1px solid var(--border);
          }
        }

        /* 减少动画 */
        @media (prefers-reduced-motion: reduce) {
          .agent,
          .agent__view-btn,
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
