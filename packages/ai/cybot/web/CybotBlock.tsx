import { useCallback, useState } from "react";
import { selectTheme } from "app/theme/themeSlice";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { useCouldEdit } from "auth/hooks/useCouldEdit";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { useModal } from "render/ui/Modal";

import toast from "react-hot-toast";
import Button from "render/web/ui/Button";
import { Dialog } from "render/web/ui/Dialog";
import { Tooltip } from "render/web/ui/Tooltip";
import EditCybot from "ai/cybot/web/EditCybot";
import { Cybot } from "../types";
import { remove } from "database/dbSlice";

import {
  CommentDiscussionIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
} from "@primer/octicons-react";

import { FaYenSign } from "react-icons/fa";

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
      await new Promise((r) => setTimeout(r, 200));
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
            <div className="cybot-block__title-container">
              <Tooltip content={`ID: ${item.id}`}>
                <h3 className="cybot-block__title">
                  {item.name || t("unnamed")}
                </h3>
              </Tooltip>
            </div>

            <div className="cybot-block__meta">
              {item.outputPrice && (
                <div className="cybot-block__price-tag">
                  <FaYenSign size={11} />
                  <span>{(item.outputPrice || 0).toFixed(2)}</span>
                </div>
              )}
            </div>
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
                  <EyeIcon size={11} />
                  <span>{t("vision")}</span>
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
          style={{ flex: 1 }}
        >
          {isLoading ? t("starting") : t("startChat")}
        </Button>

        {allowEdit && (
          <>
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
              variant="danger"
              size="medium"
              aria-label={t("delete")}
            />
          </>
        )}
      </div>

      {editVisible && (
        <Dialog
          isOpen={editVisible}
          onClose={closeEdit}
          title={`${t("edit")} ${item.name || t("cybot")}`}
          size="large"
        >
          <EditCybot initialValues={item} onClose={closeEdit} />
        </Dialog>
      )}

      <style href="cybot-block" precedence="medium">{`
        .cybot-block {
          background: ${theme.background};
          border-radius: ${theme.space[3]};
          padding: ${theme.space[6]};
          height: 100%;
          display: flex;
          flex-direction: column;
          gap: ${theme.space[4]};
          border: 1px solid ${theme.border};
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          min-width: 0;
          position: relative;
          outline: none;
          box-shadow: 0 1px 3px ${theme.shadowLight};
        }

        .cybot-block:hover {
          transform: translateY(-1px);
          border-color: ${theme.borderHover};
          box-shadow: 0 4px 12px ${theme.shadowMedium};
        }

        .cybot-block:focus {
          border-color: ${theme.primary};
          box-shadow: 0 0 0 3px ${theme.primaryGhost};
        }

        .cybot-block__meta {
          display: flex;
          align-items: flex-start;
          gap: ${theme.space[2]};
          justify-content: flex-end;
          flex-shrink: 0;
        }

        .cybot-block__header {
          display: flex;
          gap: ${theme.space[3]};
          align-items: flex-start;
        }

        .cybot-block__avatar {
          width: ${theme.space[10]};
          height: ${theme.space[10]};
          border-radius: ${theme.space[3]};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          font-weight: 600;
          flex-shrink: 0;
          background: ${theme.primaryGhost};
          color: ${theme.primary};
          border: 1px solid ${theme.primary}20;
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
          align-items: flex-start;
          justify-content: space-between;
          gap: ${theme.space[3]};
          margin-top: ${theme.space[1]};
          flex-wrap: wrap;
        }

        .cybot-block__title-container {
          min-width: 0;
          flex: 1;
        }

        .cybot-block__title {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
          color: ${theme.text};
          word-break: break-word;
          overflow-wrap: break-word;
          letter-spacing: -0.01em;
          line-height: 1.4;
        }

        .cybot-block__tags {
          display: flex;
          gap: ${theme.space[1]};
          flex-wrap: wrap;
          align-items: center;
          margin-top: ${theme.space[2]};
        }

        .cybot-block__tag {
          font-size: 0.75rem;
          color: ${theme.textTertiary};
          padding: ${theme.space[1]} ${theme.space[2]};
          background: ${theme.backgroundTertiary};
          border-radius: ${theme.space[1]};
          white-space: nowrap;
          font-weight: 500;
          border: 1px solid ${theme.borderLight};
        }

        .cybot-block__vision-tag {
          display: flex;
          align-items: center;
          gap: 3px;
          color: ${theme.primary};
          background: ${theme.primaryGhost};
          border-color: ${theme.primary}30;
        }

        .cybot-block__price-tag {
          font-size: 0.75rem;
          color: ${theme.textTertiary};
          padding: ${theme.space[1]} ${theme.space[2]};
          background: ${theme.backgroundTertiary};
          border-radius: ${theme.space[1]};
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 3px;
          font-weight: 500;
          font-variant-numeric: tabular-nums;
          border: 1px solid ${theme.borderLight};
        }

        .cybot-block__description {
          flex: 1;
          font-size: 0.875rem;
          line-height: 1.6;
          color: ${theme.textSecondary};
          margin: ${theme.space[3]} 0;
          overflow-wrap: break-word;
          white-space: pre-line;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          max-height: calc(1.6em * 4);
        }

        .cybot-block__actions {
          display: flex;
          gap: ${theme.space[2]};
          margin-top: auto;
          padding-top: ${theme.space[3]};
        }

        .cybot-block--exit {
          opacity: 0;
          transform: scale(0.96);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @media (max-width: 768px) {
          .cybot-block {
            padding: ${theme.space[5]};  
            gap: ${theme.space[3]};
            border-radius: ${theme.space[2]};
          }

          .cybot-block__avatar {
            width: ${theme.space[9]};
            height: ${theme.space[9]};
            font-size: 0.875rem;
          }

          .cybot-block__title {
            font-size: 0.9375rem;
            line-height: 1.4;
          }

          .cybot-block__title-row {
            gap: ${theme.space[2]};
          }

          .cybot-block__description {
            font-size: 0.8125rem;
            line-height: 1.5;
            -webkit-line-clamp: 4;
            margin: ${theme.space[2]} 0;
            max-height: calc(1.5em * 4);
          }

          .cybot-block__tag {
            font-size: 0.6875rem;
          }

          .cybot-block__price-tag {
            font-size: 0.6875rem;
          }
        }

        @media (max-width: 480px) {
          .cybot-block {
            padding: ${theme.space[4]};
            gap: ${theme.space[3]};
          }

          .cybot-block__header {
            gap: ${theme.space[2]};
          }

          .cybot-block__avatar {
            width: ${theme.space[8]};
            height: ${theme.space[8]};
            font-size: 0.8125rem;
          }

          .cybot-block__title {
            font-size: 0.875rem;
            line-height: 1.4;
          }

          .cybot-block__title-row {
            gap: ${theme.space[1]};
          }

          .cybot-block__meta {
            gap: ${theme.space[1]};
          }

          .cybot-block__description {
            font-size: 0.75rem;
            line-height: 1.5;
            -webkit-line-clamp: 4;
            margin: ${theme.space[2]} 0;
            max-height: calc(1.5em * 4);
          }

          .cybot-block__tag {
            font-size: 0.625rem;
            padding: ${theme.space[1]} ${theme.space[2]};
          }

          .cybot-block__price-tag {
            font-size: 0.625rem;
            padding: ${theme.space[1]} ${theme.space[2]};
          }

          .cybot-block__actions {
            flex-wrap: wrap;
            gap: ${theme.space[1]};
          }
        }
      `}</style>
    </div>
  );
};

export default CybotBlock;
