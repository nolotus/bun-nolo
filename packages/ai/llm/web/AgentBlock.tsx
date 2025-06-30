import { useCallback, useState } from "react";
import { selectTheme } from "app/settings/settingSlice";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "app/hooks";
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
          background: ${theme.background};
          border-radius: 16px;
          padding: ${theme.space[5]};
          border: 1px solid ${theme.border};
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
          display: flex;
          flex-direction: column;
          gap: ${theme.space[4]};
          height: 100%;
        }

        .agent:hover {
          transform: translateY(-4px);
          border-color: ${theme.primary}40;
          box-shadow: 0 12px 32px ${theme.shadow2};
        }

        .agent__header {
          display: flex;
          gap: ${theme.space[3]};
          align-items: flex-start;
        }

        .agent__avatar {
          flex-shrink: 0;
          position: relative;
        }

        .agent__info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: ${theme.space[2]};
        }

        .agent__title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: ${theme.space[2]};
        }

        .agent__title-container {
          display: flex;
          align-items: center;
          gap: ${theme.space[2]};
          flex: 1;
          min-width: 0;
        }

        .agent__title {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
          color: ${theme.text};
          line-height: 1.3;
        }

        .agent:hover .agent__title {
          color: ${theme.primary};
        }

        .agent__view-btn {
          background: none;
          border: none;
          color: ${theme.textTertiary};
          padding: ${theme.space[1]};
          border-radius: ${theme.space[1]};
          cursor: pointer;
          transition: all 0.2s ease;
          opacity: 0;
        }

        .agent:hover .agent__view-btn {
          opacity: 1;
          color: ${theme.primary};
        }

        .agent__price {
          font-size: 0.75rem;
          color: ${theme.textTertiary};
          padding: ${theme.space[1]} ${theme.space[2]};
          background: ${theme.backgroundTertiary};
          border-radius: ${theme.space[1]};
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 550;
        }

        .agent__tags {
          display: flex;
          gap: ${theme.space[1]};
          flex-wrap: wrap;
        }

        .agent__tag {
          font-size: 0.75rem;
          padding: ${theme.space[1]} ${theme.space[2]};
          background: ${theme.backgroundTertiary};
          border-radius: ${theme.space[1]};
          color: ${theme.textTertiary};
          font-weight: 500;
        }

        .agent__vision {
          display: flex;
          align-items: center;
          gap: 4px;
          color: ${theme.primary};
          background: ${theme.primary}15;
        }

        .agent__more {
          color: ${theme.primary};
          background: ${theme.primary}10;
        }

        .agent__desc {
          flex: 1;
          font-size: 0.9rem;
          line-height: 1.5;
          color: ${theme.textSecondary};
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .agent__actions {
          display: flex;
          gap: ${theme.space[2]};
          margin-top: auto;
        }

        .agent__primary {
          flex: 1;
        }

        .agent__secondary {
          display: flex;
          gap: ${theme.space[1]};
        }

        .agent-exit {
          opacity: 0;
          transform: scale(0.9);
          transition: all 0.25s ease;
        }

        @media (max-width: 768px) {
          .agent {
            padding: ${theme.space[4]};
          }
          
          .agent__view-btn {
            opacity: 1;
          }
          
          .agent__actions {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
};

export default AgentBlock;
