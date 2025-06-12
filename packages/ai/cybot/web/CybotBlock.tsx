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
import Avatar from "render/web/ui/Avatar";
import CybotForm from "ai/cybot/web/CybotForm";
import { Cybot } from "../types";
import { remove } from "database/dbSlice";
import { PlusIcon, SyncIcon } from "@primer/octicons-react";
import { useNavigate } from "react-router-dom";
import {
  CommentDiscussionIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowRightIcon,
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
  const navigate = useNavigate();

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

  const handleViewDetails = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/${cybotKey}`);
  };

  return (
    <div id={`cybot-${item.id}`} className="cybot-block" tabIndex={0}>
      <div className="cybot-block__header">
        <Avatar name={item.name} type="cybot" size="large" />

        <div className="cybot-block__info">
          <div className="cybot-block__title-row">
            <div className="cybot-block__title-container">
              <Tooltip content={`ID: ${item.id}`}>
                <h3 className="cybot-block__title">
                  {item.name || t("unnamed")}
                </h3>
              </Tooltip>

              <Tooltip content={t("viewDetails")}>
                <button
                  className="cybot-block__view-link"
                  onClick={handleViewDetails}
                  aria-label={t("viewDetails")}
                >
                  <ArrowRightIcon size={14} />
                </button>
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
          <CybotForm
            mode="edit"
            initialValues={item}
            onClose={closeEdit}
            CreateIcon={PlusIcon}
            EditIcon={SyncIcon}
          />
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

        .cybot-block__header {
          display: flex;
          gap: ${theme.space[3]};
          align-items: flex-start;
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
        }

        .cybot-block__title-container {
          min-width: 0;
          flex: 1;
          display: flex;
          align-items: center;
          gap: ${theme.space[2]};
        }

        .cybot-block__title {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
          color: ${theme.text};
          word-break: break-word;
          letter-spacing: -0.01em;
          line-height: 1.4;
          flex: 1;
          min-width: 0;
        }

        .cybot-block__view-link {
          background: none;
          border: none;
          color: ${theme.textTertiary};
          cursor: pointer;
          padding: ${theme.space[1]};
          border-radius: ${theme.space[1]};
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: translateX(-4px);
          flex-shrink: 0;
        }

        .cybot-block:hover .cybot-block__view-link {
          opacity: 1;
          transform: translateX(0);
        }

        .cybot-block__view-link:hover {
          color: ${theme.primary};
          background: ${theme.primaryGhost};
          transform: translateX(2px);
        }

        .cybot-block__view-link:focus {
          opacity: 1;
          outline: none;
          box-shadow: 0 0 0 2px ${theme.primaryGhost};
          color: ${theme.primary};
        }

        .cybot-block__meta {
          display: flex;
          align-items: flex-start;
          gap: ${theme.space[2]};
          flex-shrink: 0;
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

        .cybot-block__description {
          flex: 1;
          font-size: 0.875rem;
          line-height: 1.6;
          color: ${theme.textSecondary};
          margin: ${theme.space[3]} 0;
          overflow-wrap: break-word;
          white-space: pre-line;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
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
          }

          .cybot-block__view-link {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (max-width: 480px) {
          .cybot-block {
            padding: ${theme.space[4]};
            gap: ${theme.space[3]};
          }

          .cybot-block__actions {
            flex-wrap: wrap;
            gap: ${theme.space[1]};
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cybot-block {
            transition: none;
          }
          .cybot-block:hover {
            transform: none;
          }
          .cybot-block--exit {
            transition: none;
          }
          .cybot-block__view-link {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
};

export default CybotBlock;
