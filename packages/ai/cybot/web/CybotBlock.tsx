// ai/cybot/web/CybotBlock.tsx
import { useDispatch } from "react-redux";
import { useCallback, useState } from "react";
import { selectTheme } from "app/theme/themeSlice";
import { useTranslation } from "react-i18next";
import { animations } from "render/styles/animations";
import { useAppSelector } from "app/hooks";
import { useCouldEdit } from "auth/hooks/useCouldEdit";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { remove } from "database/dbSlice";
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

interface CybotBlockProps {
  item: Cybot;
  closeModal?: () => void;
  reload: () => Promise<void>;
}

const CybotBlock = ({ item, closeModal, reload }: CybotBlockProps) => {
  const { t } = useTranslation("ai");
  const theme = useAppSelector(selectTheme);
  const { isLoading, createNewDialog } = useCreateDialog();
  const { visible: editVisible, open: openEdit, close: closeEdit } = useModal();
  const dispatch = useDispatch();
  const [deleting, setDeleting] = useState(false);
  const allowEdit = useCouldEdit(item.id);

  const startDialog = async () => {
    if (isLoading) return;
    try {
      await createNewDialog({ cybots: [item.id] });
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
      await dispatch(remove(item.id)).unwrap();
      toast.success(t("deleteSuccess"));
      await reload();
    } catch (error) {
      setDeleting(false);
      toast.error(t("deleteError"));
    }
  }, [dispatch, item.id, deleting, reload, t]);

  const renderPricing = () => {
    if (!item.inputPrice && !item.outputPrice) return null;

    return (
      <div className="pricing">
        {item.inputPrice ? (
          <div className="price-tag">
            <span>
              {t("input")}: {item.inputPrice.toFixed(4)}
            </span>
          </div>
        ) : null}
        {item.outputPrice ? (
          <div className="price-tag">
            <span>
              {t("output")}: {item.outputPrice.toFixed(4)}
            </span>
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <>
      <div
        id={`cybot-${item.id}`}
        className="cybot-block"
        style={{
          transition: "all 0.3s ease-out",
        }}
      >
        <div className="header">
          <div className="avatar">{item.name?.[0]?.toUpperCase() || "?"}</div>

          <div className="info">
            <Tooltip content={`ID: ${item.id}`}>
              <h3 className="title">{item.name || t("unnamed")}</h3>
            </Tooltip>

            <div className="tags">
              <div className="tag">{item.model}</div>
              <div className="tag">{item.provider}</div>
              {item.dialogCount !== undefined && (
                <div className="tag">
                  {t("dialogCount")}: {item.dialogCount}
                </div>
              )}
              {renderPricing()}
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
          padding: 1.25rem;
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          border: 1px solid ${theme.border};
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
          transition: all ${animations.duration.normal} ease;
        }

        .cybot-block:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }

        .header {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .avatar {
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: ${theme.backgroundTertiary};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
          color: ${theme.text};
          flex-shrink: 0;
        }

        .info {
          flex: 1;
          min-width: 0;
        }

        .title {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 0.3rem;
          color: ${theme.text};
        }

        .tags {
          display: flex;
          gap: 0.4rem;
          flex-wrap: wrap;
        }

        .tag {
          font-size: 0.8rem;
          color: ${theme.textSecondary};
          padding: 0.2rem 0.5rem;
          background: ${theme.backgroundSecondary};
          border-radius: 4px;
          white-space: nowrap;
        }

        .description {
          flex: 1;
          font-size: 0.85rem;
          line-height: 1.6;
          color: ${theme.textTertiary};
          padding: 0.6rem 0;
          min-height: 3rem;
        }

        .actions {
          display: flex;
          gap: 0.75rem;
          margin-top: auto;
          align-items: center;
        }

        .edit-actions {
          display: flex;
          gap: 0.5rem;
        }

        .pricing {
          display: flex;
          gap: 0.4rem;
        }
        
        .price-tag {
          font-size: 0.8rem;
          color: ${theme.textSecondary};
          padding: 0.2rem 0.5rem;
          background: ${theme.backgroundTertiary};
          border-radius: 4px;
          white-space: nowrap;
          border: 1px solid ${theme.border};
        }
        
        .price-tag span {
          color: ${theme.accent};
        }
      `}</style>
    </>
  );
};

export default CybotBlock;
