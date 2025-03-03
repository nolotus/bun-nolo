import { useCallback, useState } from "react";
import { selectTheme } from "app/theme/themeSlice";
import { useTranslation } from "react-i18next";
import { animations } from "render/styles/animations";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { useCouldEdit } from "auth/hooks/useCouldEdit";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { useModal } from "render/ui/Modal";

import toast from "react-hot-toast";
import Button from "web/ui/Button";
import { IconHoverButton } from "render/ui/IconHoverButton";
import { Dialog } from "render/ui/Dialog";
import { Tooltip } from "web/ui/Tooltip";
import {
  CommentDiscussionIcon,
  PencilIcon,
  TrashIcon,
} from "@primer/octicons-react";
import EditCybot from "ai/cybot/web/EditCybot";
import { Cybot } from "../types";
import { remove } from "database/dbSlice";

interface CybotBlockProps {
  item: Cybot;
  closeModal?: () => void;
  reload: () => Promise<void>;
}

const CybotBlock = ({ item, closeModal, reload }: CybotBlockProps) => {
  const { t } = useTranslation("ai");
  const theme = useAppSelector(selectTheme);
  const dispatch = useAppDispatch();
  const cybotKey = item.dbKey || item.id;
  const { isLoading, createNewDialog } = useCreateDialog();
  const { visible: editVisible, open: openEdit, close: closeEdit } = useModal();
  const [deleting, setDeleting] = useState(false);
  const allowEdit = useCouldEdit(item.id);

  const startDialog = async () => {
    if (isLoading) return;
    try {
      await createNewDialog({ cybots: [cybotKey] });
      closeModal?.();
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

      await new Promise((r) => setTimeout(r, 50));
      await dispatch(remove(cybotKey));
      toast.success(t("deleteSuccess"));
      await reload();
    } catch (error) {
      setDeleting(false);
      toast.error(t("deleteError"));
    }
  }, [item.id, deleting, reload, t]);

  const renderPricing = () => {
    if (!item.inputPrice && !item.outputPrice) return null;

    const formatPrice = (price?: number) => {
      if (!price) return "0";
      return Number(price.toFixed(2)).toString();
    };

    return (
      <div className="price-tag">
        <span>
          {t("price")}: {formatPrice(item.inputPrice)}/
          {formatPrice(item.outputPrice)}
        </span>
      </div>
    );
  };

  const renderTags = () => {
    // 如果 item.tags 存在且是数组，渲染每个标签
    if (!item.tags || !Array.isArray(item.tags) || item.tags.length === 0) {
      return null;
    }

    return item.tags.map((tag, index) => (
      <div key={index} className="tag">
        {tag}
      </div>
    ));
  };

  return (
    <>
      <div id={`cybot-${item.id}`} className="cybot-block">
        <div className="header">
          <div className="avatar">{item.name?.[0]?.toUpperCase() || "?"}</div>

          <div className="info">
            <div className="title-row">
              <Tooltip content={`ID: ${item.id}`}>
                <h3 className="title">{item.name || t("unnamed")}</h3>
              </Tooltip>
              {renderPricing()}
            </div>

            <div className="tags">
              <div className="tag">{item.model}</div>
              <div className="tag">{item.provider}</div>
              {item.dialogCount !== undefined && (
                <div className="tag">
                  {t("dialogCount")}: {item.dialogCount}
                </div>
              )}
              {renderTags()} {/* 添加 tags 渲染 */}
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
      </div>

      <style>{`
        .cybot-block {
          background: ${theme.background};
          border-radius: 12px;
          padding: clamp(0.875rem, 2vw, 1.25rem);
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
          border: 1px solid ${theme.border};
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: all ${animations.duration.normal} ease;
          min-width: 280px;
        }

        .header {
          display: flex;
          gap: 0.75rem;
        }

        .avatar {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          background: ${theme.backgroundTertiary};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          color: ${theme.text};
          flex-shrink: 0;
        }

        .info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }

        .title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .title {
          font-size: 0.95rem;
          font-weight: 600;
          margin: 0;
          color: ${theme.text};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tags {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
          align-items: center;
        }

        .tag {
          font-size: 0.75rem;
          color: ${theme.textSecondary};
          padding: 0.15rem 0.4rem;
          background: ${theme.backgroundSecondary};
          border-radius: 4px;
          white-space: nowrap;
        }

        .price-tag {
          font-size: 0.75rem;
          color: ${theme.accent};
          padding: 0.15rem 0.4rem;
          background: ${theme.backgroundTertiary};
          border-radius: 4px;
          white-space: nowrap;
        }

        .description {
          flex: 1;
          font-size: 0.85rem;
          line-height: 1.5;
          color: ${theme.textTertiary};
          margin: 0.2rem 0;
          overflow-wrap: break-word;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .actions {
          display: flex;
          gap: 0.5rem;
          margin-top: auto;
        }

        .edit-actions {
          display: flex;
          gap: 0.4rem;
        }

        @media (max-width: 480px) {
          .cybot-block {
            padding: 0.75rem;
            gap: 0.75rem;
          }

          .actions {
            flex-direction: column;
          }

          .edit-actions {
            justify-content: stretch;
          }

          .edit-actions button {
            flex: 1;
          }
        }

        .cybot-block:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }

        .item-exit {
          opacity: 0;
          transform: scale(0.9);
        }
      `}</style>
    </>
  );
};

export default CybotBlock;
