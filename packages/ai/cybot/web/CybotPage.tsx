import { useCallback, useState } from "react";
import { selectTheme } from "app/theme/themeSlice";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "app/hooks";
import { useFetchData } from "app/hooks";
import { useCouldEdit } from "auth/hooks/useCouldEdit";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { useModal } from "render/ui/Modal";

import toast from "react-hot-toast";
import Button from "render/web/ui/Button";
import { Dialog } from "render/web/ui/Dialog";
import { Tooltip } from "render/web/ui/Tooltip";
import Avatar from "render/web/ui/Avatar";
import BotForm from "../../llm/web/BotForm";
import { Cybot } from "../types";
import { remove } from "database/dbSlice";
import { PlusIcon, SyncIcon } from "@primer/octicons-react";

import {
  CommentDiscussionIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ArrowLeftIcon,
  CalendarIcon,
  TagIcon,
  CpuIcon,
  EyeClosedIcon,
} from "@primer/octicons-react";

import { FaYenSign } from "react-icons/fa";

interface CybotDetailPageProps {
  cybotKey: string;
  onBack?: () => void;
}

const CybotDetailPage = ({ cybotKey, onBack }: CybotDetailPageProps) => {
  const { t } = useTranslation("ai");
  const theme = useAppSelector(selectTheme);
  const dispatch = useAppDispatch();
  const { isLoading: dialogLoading, createNewDialog } = useCreateDialog();
  const { visible: editVisible, open: openEdit, close: closeEdit } = useModal();
  const [deleting, setDeleting] = useState(false);
  const allowEdit = useCouldEdit(cybotKey);

  // 获取数据
  const { data: item, isLoading, error } = useFetchData<Cybot>(cybotKey);

  const handleDelete = useCallback(async () => {
    if (deleting || !item) return;
    setDeleting(true);

    try {
      await dispatch(remove(cybotKey));
      toast.success(t("deleteSuccess"));
      onBack?.();
    } catch (error) {
      setDeleting(false);
      toast.error(t("deleteError"));
    }
  }, [item, cybotKey, deleting, dispatch, t, onBack]);

  const startDialog = useCallback(async () => {
    if (dialogLoading) return;
    try {
      await createNewDialog({ cybots: [cybotKey] });
    } catch (error) {
      toast.error(t("createDialogError"));
    }
  }, [dialogLoading, createNewDialog, cybotKey, t]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  if (isLoading) {
    return (
      <div className="cybot-detail-page">
        <div className="cybot-detail-page__container">
          {/* 加载状态 */}
          <div className="cybot-detail-page__loading">
            <div className="cybot-detail-page__skeleton cybot-detail-page__header-skeleton"></div>
            <div className="cybot-detail-page__skeleton cybot-detail-page__content-skeleton"></div>
            <div className="cybot-detail-page__skeleton cybot-detail-page__actions-skeleton"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="cybot-detail-page">
        <div className="cybot-detail-page__container">
          <div className="cybot-detail-page__error">
            <h2>{t("loadError")}</h2>
            <p>{error.message}</p>
            <Button onClick={handleBack} variant="secondary">
              {t("goBack")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return null;
  }

  return (
    <div className="cybot-detail-page">
      <div className="cybot-detail-page__container">
        {/* 顶部导航 */}
        <div className="cybot-detail-page__nav">
          <Button
            icon={<ArrowLeftIcon size={16} />}
            onClick={handleBack}
            variant="ghost"
            size="medium"
          >
            {t("back")}
          </Button>
        </div>

        {/* 主要信息区域 */}
        <div className="cybot-detail-page__main">
          {/* 头部信息 */}
          <div className="cybot-detail-page__header">
            <div className="cybot-detail-page__avatar-section">
              <Avatar name={item.name} type="cybot" size="xlarge" />
            </div>

            <div className="cybot-detail-page__info">
              <div className="cybot-detail-page__title-section">
                <h1 className="cybot-detail-page__title">
                  {item.name || t("unnamed")}
                </h1>

                <div className="cybot-detail-page__badges">
                  {item.hasVision ? (
                    <Tooltip content={t("hasVision")}>
                      <div className="cybot-detail-page__badge cybot-detail-page__vision-badge">
                        <EyeIcon size={14} />
                        <span>{t("vision")}</span>
                      </div>
                    </Tooltip>
                  ) : (
                    <Tooltip content={t("noVision")}>
                      <div className="cybot-detail-page__badge cybot-detail-page__no-vision-badge">
                        <EyeClosedIcon size={14} />
                        <span>{t("textOnly")}</span>
                      </div>
                    </Tooltip>
                  )}

                  {item.outputPrice && (
                    <div className="cybot-detail-page__badge cybot-detail-page__price-badge">
                      <FaYenSign size={12} />
                      <span>{item.outputPrice.toFixed(2)}/输出</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="cybot-detail-page__meta">
                <div className="cybot-detail-page__meta-item">
                  <Tooltip content={`ID: ${item.id}`}>
                    <span className="cybot-detail-page__id">#{item.id}</span>
                  </Tooltip>
                </div>

                {item.createdAt && (
                  <div className="cybot-detail-page__meta-item">
                    <CalendarIcon size={14} />
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 描述内容 */}
          {item.introduction && (
            <div className="cybot-detail-page__section">
              <h3 className="cybot-detail-page__section-title">
                <CpuIcon size={16} />
                {t("introduction")}
              </h3>
              <div className="cybot-detail-page__description">
                {item.introduction}
              </div>
            </div>
          )}

          {/* 标签区域 */}
          {item.tags && item.tags.length > 0 && (
            <div className="cybot-detail-page__section">
              <h3 className="cybot-detail-page__section-title">
                <TagIcon size={16} />
                {t("tags")}
              </h3>
              <div className="cybot-detail-page__tags">
                {item.tags.map((tag, index) => (
                  <span key={index} className="cybot-detail-page__tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 其他详细信息 */}
          <div className="cybot-detail-page__section">
            <h3 className="cybot-detail-page__section-title">{t("details")}</h3>
            <div className="cybot-detail-page__details-grid">
              <div className="cybot-detail-page__detail-item">
                <span className="cybot-detail-page__detail-label">
                  {t("model")}
                </span>
                <span className="cybot-detail-page__detail-value">
                  {item.model || t("notSpecified")}
                </span>
              </div>

              <div className="cybot-detail-page__detail-item">
                <span className="cybot-detail-page__detail-label">
                  {t("temperature")}
                </span>
                <span className="cybot-detail-page__detail-value">
                  {item.temperature ?? t("notSpecified")}
                </span>
              </div>

              <div className="cybot-detail-page__detail-item">
                <span className="cybot-detail-page__detail-label">
                  {t("maxTokens")}
                </span>
                <span className="cybot-detail-page__detail-value">
                  {item.maxTokens || t("notSpecified")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 固定底部操作栏 */}
        <div className="cybot-detail-page__actions">
          <Button
            icon={<CommentDiscussionIcon size={16} />}
            onClick={startDialog}
            disabled={dialogLoading}
            loading={dialogLoading}
            size="large"
            variant="primary"
            style={{ flex: 1 }}
          >
            {dialogLoading ? t("starting") : t("startChat")}
          </Button>

          {allowEdit && (
            <>
              <Button
                icon={<PencilIcon size={16} />}
                onClick={openEdit}
                variant="secondary"
                size="large"
              >
                {t("edit")}
              </Button>
              <Button
                icon={<TrashIcon size={16} />}
                onClick={handleDelete}
                disabled={deleting}
                loading={deleting}
                variant="danger"
                size="large"
              >
                {deleting ? t("deleting") : t("delete")}
              </Button>
            </>
          )}
        </div>
      </div>

      {editVisible && (
        <Dialog
          isOpen={editVisible}
          onClose={closeEdit}
          title={`${t("edit")} ${item.name || t("cybot")}`}
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

      <style href="cybot-detail-page" precedence="medium">{`
        .cybot-detail-page {
          min-height: 100vh;
          background: ${theme.background};
          padding: ${theme.space[4]};
        }

        .cybot-detail-page__container {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: ${theme.space[6]};
        }

        .cybot-detail-page__nav {
          padding-bottom: ${theme.space[4]};
          border-bottom: 1px solid ${theme.border};
        }

        .cybot-detail-page__main {
          display: flex;
          flex-direction: column;
          gap: ${theme.space[8]};
          flex: 1;
        }

        .cybot-detail-page__header {
          display: flex;
          gap: ${theme.space[6]};
          align-items: flex-start;
        }

        .cybot-detail-page__avatar-section {
          flex-shrink: 0;
        }

        .cybot-detail-page__info {
          flex: 1;
          min-width: 0;
        }

        .cybot-detail-page__title-section {
          margin-bottom: ${theme.space[4]};
        }

        .cybot-detail-page__title {
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 ${theme.space[3]} 0;
          color: ${theme.text};
          line-height: 1.2;
          word-break: break-word;
        }

        .cybot-detail-page__badges {
          display: flex;
          gap: ${theme.space[2]};
          flex-wrap: wrap;
        }

        .cybot-detail-page__badge {
          display: flex;
          align-items: center;
          gap: ${theme.space[1]};
          padding: ${theme.space[2]} ${theme.space[3]};
          border-radius: ${theme.space[2]};
          font-size: 0.875rem;
          font-weight: 500;
        }

        .cybot-detail-page__vision-badge {
          background: ${theme.primaryGhost};
          color: ${theme.primary};
          border: 1px solid ${theme.primary}30;
        }

        .cybot-detail-page__no-vision-badge {
          background: ${theme.backgroundTertiary};
          color: ${theme.textTertiary};
          border: 1px solid ${theme.borderLight};
        }

        .cybot-detail-page__price-badge {
          background: ${theme.backgroundSecondary};
          color: ${theme.textSecondary};
          border: 1px solid ${theme.border};
        }

        .cybot-detail-page__meta {
          display: flex;
          gap: ${theme.space[4]};
          align-items: center;
        }

        .cybot-detail-page__meta-item {
          display: flex;
          align-items: center;
          gap: ${theme.space[1]};
          color: ${theme.textTertiary};
          font-size: 0.875rem;
        }

        .cybot-detail-page__id {
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
          background: ${theme.backgroundTertiary};
          padding: ${theme.space[1]} ${theme.space[2]};
          border-radius: ${theme.space[1]};
          font-size: 0.75rem;
        }

        .cybot-detail-page__section {
          background: ${theme.backgroundSecondary};
          border-radius: ${theme.space[3]};
          padding: ${theme.space[6]};
          border: 1px solid ${theme.border};
        }

        .cybot-detail-page__section-title {
          display: flex;
          align-items: center;
          gap: ${theme.space[2]};
          font-size: 1.125rem;
          font-weight: 600;
          margin: 0 0 ${theme.space[4]} 0;
          color: ${theme.text};
        }

        .cybot-detail-page__description {
          font-size: 1rem;
          line-height: 1.6;
          color: ${theme.textSecondary};
          white-space: pre-wrap;
          word-break: break-word;
        }

        .cybot-detail-page__tags {
          display: flex;
          gap: ${theme.space[2]};
          flex-wrap: wrap;
        }

        .cybot-detail-page__tag {
          background: ${theme.backgroundTertiary};
          color: ${theme.textSecondary};
          padding: ${theme.space[2]} ${theme.space[3]};
          border-radius: ${theme.space[2]};
          font-size: 0.875rem;
          font-weight: 500;
          border: 1px solid ${theme.borderLight};
        }

        .cybot-detail-page__details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: ${theme.space[4]};
        }

        .cybot-detail-page__detail-item {
          display: flex;
          flex-direction: column;
          gap: ${theme.space[1]};
        }

        .cybot-detail-page__detail-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: ${theme.textTertiary};
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .cybot-detail-page__detail-value {
          font-size: 0.875rem;
          color: ${theme.textSecondary};
          font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
        }

        .cybot-detail-page__actions {
          position: sticky;
          bottom: ${theme.space[4]};
          background: ${theme.backgroundGhost};
          backdrop-filter: blur(8px);
          border: 1px solid ${theme.border};
          border-radius: ${theme.space[3]};
          padding: ${theme.space[4]};
          display: flex;
          gap: ${theme.space[3]};
          box-shadow: 0 4px 12px ${theme.shadowMedium};
        }

        .cybot-detail-page__loading,
        .cybot-detail-page__error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: ${theme.space[4]};
          padding: ${theme.space[12]};
          text-align: center;
        }

        .cybot-detail-page__skeleton {
          background: linear-gradient(90deg, ${theme.backgroundTertiary} 25%, ${theme.backgroundSecondary} 50%, ${theme.backgroundTertiary} 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: ${theme.space[2]};
        }

        .cybot-detail-page__header-skeleton {
          height: 120px;
          margin-bottom: ${theme.space[6]};
        }

        .cybot-detail-page__content-skeleton {
          height: 200px;
          margin-bottom: ${theme.space[6]};
        }

        .cybot-detail-page__actions-skeleton {
          height: 60px;
        }

        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 768px) {
          .cybot-detail-page {
            padding: ${theme.space[3]};
          }

          .cybot-detail-page__header {
            flex-direction: column;
            gap: ${theme.space[4]};
            text-align: center;
          }

          .cybot-detail-page__title {
            font-size: 1.5rem;
          }

          .cybot-detail-page__section {
            padding: ${theme.space[4]};
          }

          .cybot-detail-page__actions {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            border-radius: 0;
            border-left: none;
            border-right: none;
            border-bottom: none;
            margin: 0;
          }

          .cybot-detail-page__container {
            padding-bottom: 100px;
          }
        }

        @media (max-width: 480px) {
          .cybot-detail-page__actions {
            flex-direction: column;
          }

          .cybot-detail-page__details-grid {
            grid-template-columns: 1fr;
          }

          .cybot-detail-page__badges {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default CybotDetailPage;
