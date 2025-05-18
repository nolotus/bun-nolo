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

// 使用原始的 Octicons 图标以确保兼容性
import {
  CommentDiscussionIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon, // 引入 EyeIcon 作为视觉能力图标
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
      element?.classList.add("cybot-block--exit");
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
      <div className="cybot-block__header">
        <div className="cybot-block__avatar">
          {item.name?.[0]?.toUpperCase() || "?"}
        </div>

        <div className="cybot-block__info">
          <div className="cybot-block__title-row">
            <Tooltip content={`ID: ${item.id}`}>
              <h3 className="cybot-block__title">
                {item.name || t("unnamed")}
              </h3>
            </Tooltip>

            {(item.inputPrice || item.outputPrice) && (
              <div className="cybot-block__price-tag">
                {(item.inputPrice || 0).toFixed(2)}/
                {(item.outputPrice || 0).toFixed(2)}
              </div>
            )}
          </div>

          <div className="cybot-block__tags">
            {item.tags?.map((tag, index) => (
              <span key={index} className="cybot-block__tag">
                {tag}
              </span>
            ))}
            {item.hasVision && (
              <Tooltip content={t("hasVision")}>
                <span className="cybot-block__tag cybot-block__vision-tag">
                  <EyeIcon size={12} /> {t("vision")}
                </span>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      <div className="cybot-block__description">
        {item.introduction || t("noDescription")}
      </div>

      <div className="cybot-block__actions">
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
          <div className="cybot-block__edit-actions">
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

      <style href="cybot-block" precedence="medium">{`
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

        .cybot-block__header {
          display: flex;
          gap: ${theme.space[3]};
          align-items: center;
        }

        .cybot-block__avatar {
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

        .cybot-block__info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: ${theme.space[2]};
        }

        .cybot-block__title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: ${theme.space[3]};
        }

        .cybot-block__title {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
          color: ${theme.text};
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cybot-block__tags {
          display: flex;
          gap: ${theme.space[2]};
          flex-wrap: wrap;
          align-items: center;
        }

        .cybot-block__tag {
          font-size: 0.75rem;
          color: ${theme.textSecondary};
          padding: ${theme.space[1]} ${theme.space[2]};
          background: ${theme.backgroundSecondary};
          border-radius: 6px;
          white-space: nowrap;
          border: 1px solid ${theme.border};
        }

        .cybot-block__vision-tag {
          display: flex;
          align-items: center;
          gap: ${theme.space[1]};
        }

        .cybot-block__price-tag {
          font-size: 0.75rem;
          color: ${theme.textSecondary};
          padding: ${theme.space[1]} ${theme.space[2]};
          background: ${theme.backgroundSecondary};
          border-radius: 6px;
          white-space: nowrap;
          border: 1px solid ${theme.border};
        }

        .cybot-block__description {
          flex: 1;
          font-size: 0.9rem;
          line-height: 1.5;
          color: ${theme.textSecondary};
          margin: ${theme.space[1]} 0;
          overflow-wrap: break-word;
          white-space: pre-line; /* 保留换行符效果 */
          display: -webkit-box;
          -webkit-line-clamp: 3; /* 增加到3行 */
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cybot-block__actions {
          display: flex;
          gap: ${theme.space[3]};
          margin-top: auto;
        }

        .cybot-block__edit-actions {
          display: flex;
          gap: ${theme.space[2]};
        }

        .cybot-block--exit {
          opacity: 0;
          transform: scale(0.98);
          transition: all 0.15s ease;
        }

        @media (max-width: 768px) {
          .cybot-block {
            padding: ${theme.space[4]};
            gap: ${theme.space[3]};
          }

          .cybot-block__description {
            -webkit-line-clamp: 4; /* 增加到4行 */
          }
        }

        @media (max-width: 480px) {
          .cybot-block {
            padding: ${theme.space[4]};
            gap: ${theme.space[3]};
          }

          .cybot-block__actions {
            flex-direction: column;
            gap: ${theme.space[2]};
          }

          .cybot-block__edit-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            width: 100%;
            gap: ${theme.space[3]};
          }

          .cybot-block__avatar {
            width: 38px;
            height: 38px;
          }

          .cybot-block__title {
            font-size: 0.95rem;
          }

          .cybot-block__description {
            font-size: 0.85rem;
            -webkit-line-clamp: 4; /* 增加到4行 */
          }

          .cybot-block__tags {
            margin-top: ${theme.space[1]};
          }
        }
      `}</style>
    </div>
  );
};

export default CybotBlock;
