import { useCallback, useState } from "react";
import { selectTheme } from "app/theme/themeSlice";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { useCouldEdit } from "auth/hooks/useCouldEdit";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { useModal } from "render/ui/Modal";

import toast from "react-hot-toast";
import Button from "render/web/ui/Button";
import { IconHoverButton } from "render/ui/IconHoverButton";
import { Dialog } from "render/web/ui/Dialog";
import { Tooltip } from "web/ui/Tooltip";
import EditCybot from "ai/cybot/web/EditCybot";
import { Cybot } from "../types";
import { remove } from "database/dbSlice";

// Using the original Octicons for compatibility
import {
  CommentDiscussionIcon,
  PencilIcon,
  TrashIcon,
} from "@primer/octicons-react";

interface CybotBlockProps {
  item: Cybot;
  reload: () => Promise<void>;
}

const CybotBlock = ({ item, reload }: CybotBlockProps) => {
  const { t } = useTranslation("ai");
  const theme = useAppSelector(selectTheme);
  const dispatch = useAppDispatch();
  const cybotKey = item.dbKey || item.id;
  const { isLoading, createNewDialog } = useCreateDialog();
  const { visible: editVisible, open: openEdit, close: closeEdit } = useModal();
  const [deleting, setDeleting] = useState(false);
  const allowEdit = useCouldEdit(cybotKey);

  const startDialog = async () => {
    if (isLoading) return;
    try {
      await createNewDialog({ cybots: [cybotKey] });
    } catch (error) {
      toast.error(t("createDialogError"));
    }
  };

  const handleDelete = useCallback(async () => {
    if (deleting) return;
    setDeleting(true);

    try {
      const element = document.getElementById(`cybot-${item.id}`);
      element?.classList.add("item-exit");
      await new Promise((r) => setTimeout(r, 150));
      await dispatch(remove(cybotKey));
      toast.success(t("deleteSuccess"));
      await reload();
    } catch (error) {
      setDeleting(false);
      toast.error(t("deleteError"));
    }
  }, [item.id, cybotKey, deleting, dispatch, reload, t]);

  return (
    <div id={`cybot-${item.id}`} className="cybot-block" tabIndex={0}>
      <div className="header">
        <div className="avatar">{item.name?.[0]?.toUpperCase() || "?"}</div>

        <div className="info">
          <div className="title-row">
            <Tooltip content={`ID: ${item.id}`}>
              <h3 className="title">{item.name || t("unnamed")}</h3>
            </Tooltip>

            {(item.inputPrice || item.outputPrice) && (
              <div className="price-tag">
                {(item.inputPrice || 0).toFixed(2)}/
                {(item.outputPrice || 0).toFixed(2)}
              </div>
            )}
          </div>

          <div className="tags">
            {item.model && <span className="tag">{item.model}</span>}
            {item.tags?.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="description">
        {item.introduction || t("noDescription")}
      </div>

      <div className="actions">
        <Button
          icon={<CommentDiscussionIcon size={16} />}
          onClick={startDialog}
          disabled={isLoading}
          loading={isLoading}
          size="medium"
          style={{ flex: 2 }}
        >
          {isLoading ? t("starting") : t("startChat")}
        </Button>

        {allowEdit && (
          <div className="edit-actions">
            <IconHoverButton
              icon={<PencilIcon size={16} />}
              variant="secondary"
              onClick={openEdit}
              size="medium"
            >
              {t("edit")}
            </IconHoverButton>

            <IconHoverButton
              icon={<TrashIcon size={16} />}
              variant="danger"
              onClick={handleDelete}
              disabled={deleting}
              size="medium"
            >
              {t("delete")}
            </IconHoverButton>
          </div>
        )}
      </div>

      {editVisible && (
        <Dialog
          isOpen={editVisible}
          onClose={closeEdit}
          title={`${t("edit")} ${item.name || t("cybot")}`}
        >
          <EditCybot initialValues={item} onClose={closeEdit} />
        </Dialog>
      )}

      <style jsx>{`
        .cybot-block {
          background: ${theme.background};
          border-radius: 12px;
          padding: 1.25rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          border: 1px solid ${theme.border};
          transition: all 0.15s ease;
          min-width: 280px;
          position: relative;
          outline: none;
        }

        .cybot-block:hover {
          transform: translateY(-2px);
          border-color: ${theme.primary}30;
        }

        .cybot-block:focus {
          border-color: ${theme.primary};
        }

        .header {
          display: flex;
          gap: 0.875rem;
          align-items: center;
        }

        .avatar {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          font-weight: 600;
          flex-shrink: 0;
          background: ${theme.primaryGhost}30;
          color: ${theme.primary};
        }

        .info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }

        .title {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
          color: ${theme.text};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tags {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .tag {
          font-size: 0.75rem;
          color: ${theme.textSecondary};
          padding: 0.2rem 0.5rem;
          background: ${theme.backgroundSecondary};
          border-radius: 6px;
          white-space: nowrap;
          border: 1px solid ${theme.border};
        }

        .price-tag {
          font-size: 0.75rem;
          color: ${theme.textSecondary};
          padding: 0.2rem 0.5rem;
          background: ${theme.backgroundSecondary};
          border-radius: 6px;
          white-space: nowrap;
          border: 1px solid ${theme.border};
        }

        .description {
          flex: 1;
          font-size: 0.9rem;
          line-height: 1.5;
          color: ${theme.textSecondary};
          margin: 0.2rem 0;
          overflow-wrap: break-word;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }

        .edit-actions {
          display: flex;
          gap: 0.5rem;
        }

        .item-exit {
          opacity: 0;
          transform: scale(0.98);
          transition: all 0.15s ease;
        }

        @media (max-width: 480px) {
          .cybot-block {
            padding: 1rem;
            gap: 0.875rem;
          }

          .actions {
            flex-direction: column;
            gap: 0.6rem;
          }

          .edit-actions {
            justify-content: stretch;
            gap: 0.75rem;
          }

          .edit-actions button {
            flex: 1;
          }

          .avatar {
            width: 38px;
            height: 38px;
          }

          .title {
            font-size: 0.95rem;
          }

          .description {
            font-size: 0.85rem;
            -webkit-line-clamp: 3;
          }
        }
      `}</style>
    </div>
  );
};

export default CybotBlock;
