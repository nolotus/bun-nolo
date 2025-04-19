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
import { Tooltip } from "render/web/ui/Tooltip";
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
          padding: ${theme.space[5]};
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: ${theme.space[4]};
          border: 1px solid ${theme.border};
          transition: all 0.15s ease;
          min-width: 0;
          position: relative;
          outline: none;
          box-shadow: 0 2px 8px ${theme.shadowLight};
        }

        .cybot-block:hover {
          transform: translateY(-2px);
          border-color: ${theme.primary}30;
          box-shadow: 0 4px 12px ${theme.shadowMedium};
        }

        .cybot-block:focus {
          border-color: ${theme.primary};
        }

        .header {
          display: flex;
          gap: ${theme.space[3]};
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
          gap: ${theme.space[2]};
        }

        .title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: ${theme.space[3]};
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
          gap: ${theme.space[2]};
          flex-wrap: wrap;
          align-items: center;
        }

        .tag {
          font-size: 0.75rem;
          color: ${theme.textSecondary};
          padding: ${theme.space[1]} ${theme.space[2]};
          background: ${theme.backgroundSecondary};
          border-radius: 6px;
          white-space: nowrap;
          border: 1px solid ${theme.border};
        }

        .price-tag {
          font-size: 0.75rem;
          color: ${theme.textSecondary};
          padding: ${theme.space[1]} ${theme.space[2]};
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
          margin: ${theme.space[1]} 0;
          overflow-wrap: break-word;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .actions {
          display: flex;
          gap: ${theme.space[3]};
          margin-top: auto;
        }

        .edit-actions {
          display: flex;
          gap: ${theme.space[2]};
        }

        .item-exit {
          opacity: 0;
          transform: scale(0.98);
          transition: all 0.15s ease;
        }

        @media (max-width: 768px) {
          .cybot-block {
            padding: ${theme.space[4]};
            gap: ${theme.space[3]};
          }

          .description {
            -webkit-line-clamp: 3;
          }
        }

        @media (max-width: 480px) {
          .cybot-block {
            padding: ${theme.space[4]};
            gap: ${theme.space[3]};
          }

          .actions {
            flex-direction: column;
            gap: ${theme.space[2]};
          }

          .edit-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            width: 100%;
            gap: ${theme.space[3]};
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

          .tags {
            margin-top: ${theme.space[1]};
          }
        }
      `}</style>
    </div>
  );
};

export default CybotBlock;
