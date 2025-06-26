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
import Avatar from "render/web/ui/Avatar";
import BotForm from "ai/llm/web/BotForm";

import { Agent } from "app/types";
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

interface AgentPageProps {
  agentKey: string;
  onBack?: () => void;
}

const AgentPage = ({ agentKey, onBack }: AgentPageProps) => {
  const { t } = useTranslation("ai");
  const theme = useAppSelector(selectTheme);
  const dispatch = useAppDispatch();
  const { isLoading: dialogLoading, createNewDialog } = useCreateDialog();
  const { visible: editVisible, open: openEdit, close: closeEdit } = useModal();
  const [deleting, setDeleting] = useState(false);
  const allowEdit = useCouldEdit(agentKey);

  const { data: item, isLoading, error } = useFetchData<Agent>(agentKey);

  const handleDelete = useCallback(async () => {
    if (deleting || !item) return;
    setDeleting(true);

    try {
      await dispatch(remove(agentKey));
      toast.success(t("deleteSuccess"));
      onBack?.();
    } catch (error) {
      setDeleting(false);
      toast.error(t("deleteError"));
    }
  }, [item, agentKey, deleting, dispatch, t, onBack]);

  const startDialog = useCallback(async () => {
    if (dialogLoading) return;
    try {
      await createNewDialog({ agents: [agentKey] });
    } catch (error) {
      toast.error(t("createDialogError"));
    }
  }, [dialogLoading, createNewDialog, agentKey, t]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  if (isLoading) {
    return (
      <div className="agent-page">
        <div className="container">
          <div className="loading">
            <div className="skeleton header-skeleton"></div>
            <div className="skeleton content-skeleton"></div>
            <div className="skeleton actions-skeleton"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="agent-page">
        <div className="container">
          <div className="error">
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

  if (!item) return null;

  return (
    <div className="agent-page">
      <div className="container">
        {/* Back button */}
        <div className="nav">
          <Button
            icon={<ArrowLeftIcon size={16} />}
            onClick={handleBack}
            variant="ghost"
          >
            {t("back")}
          </Button>
        </div>

        {/* Hero section */}
        <div className="hero">
          <div className="hero-content">
            <div className="avatar-section">
              <Avatar name={item.name} type="agent" size="xlarge" />
            </div>

            <div className="info">
              <h1 className="title">{item.name || t("unnamed")}</h1>

              <div className="badges">
                {item.hasVision ? (
                  <span className="badge vision">
                    <EyeIcon size={14} />
                    {t("vision")}
                  </span>
                ) : (
                  <span className="badge text-only">
                    <EyeClosedIcon size={14} />
                    {t("textOnly")}
                  </span>
                )}

                {item.outputPrice && (
                  <span className="badge price">
                    <FaYenSign size={12} />
                    {item.outputPrice.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="meta">
                <span className="id">#{item.id}</span>
                {item.createdAt && (
                  <span className="date">
                    <CalendarIcon size={14} />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content sections */}
        <div className="content">
          {item.introduction && (
            <section className="section">
              <h2 className="section-title">
                <CpuIcon size={18} />
                {t("introduction")}
              </h2>
              <p className="description">{item.introduction}</p>
            </section>
          )}

          {item.tags && item.tags.length > 0 && (
            <section className="section">
              <h2 className="section-title">
                <TagIcon size={18} />
                {t("tags")}
              </h2>
              <div className="tags">
                {item.tags.map((tag, i) => (
                  <span key={i} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="section">
            <h2 className="section-title">{t("details")}</h2>
            <div className="details">
              <div className="detail">
                <span className="label">{t("model")}</span>
                <span className="value">{item.model || t("notSpecified")}</span>
              </div>
              <div className="detail">
                <span className="label">{t("temperature")}</span>
                <span className="value">
                  {item.temperature ?? t("notSpecified")}
                </span>
              </div>
              <div className="detail">
                <span className="label">{t("maxTokens")}</span>
                <span className="value">
                  {item.maxTokens || t("notSpecified")}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Actions */}
        <div className="actions">
          <Button
            icon={<CommentDiscussionIcon size={16} />}
            onClick={startDialog}
            disabled={dialogLoading}
            loading={dialogLoading}
            size="large"
            className="primary-action"
          >
            {dialogLoading ? t("starting") : t("startChat")}
          </Button>

          {allowEdit && (
            <div className="secondary-actions">
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
                {t("delete")}
              </Button>
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
          <BotForm
            mode="edit"
            initialValues={item}
            onClose={closeEdit}
            CreateIcon={PlusIcon}
            EditIcon={SyncIcon}
          />
        </Dialog>
      )}

      <style href="agent-page" precedence="medium">{`
        .agent-page {
          min-height: 100vh;
          background: linear-gradient(135deg, ${theme.background} 0%, ${theme.backgroundSecondary} 100%);
          padding: ${theme.space[3]};
        }

        .container {
          max-width: 720px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: ${theme.space[6]};
        }

        .nav {
          display: flex;
          align-items: center;
        }

        .hero {
          background: ${theme.background};
          border-radius: 24px;
          padding: ${theme.space[8]};
          border: 1px solid ${theme.border};
          box-shadow: 0 8px 32px ${theme.shadow1};
          position: relative;
          overflow: hidden;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 120px;
          background: linear-gradient(135deg, ${theme.primary}08 0%, transparent 70%);
          pointer-events: none;
        }

        .hero-content {
          position: relative;
          display: flex;
          align-items: center;
          gap: ${theme.space[6]};
        }

        .avatar-section {
          flex-shrink: 0;
          position: relative;
        }

        .avatar-section::after {
          content: '';
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          background: linear-gradient(135deg, ${theme.primary}20 0%, transparent 60%);
          opacity: 0.6;
          z-index: -1;
        }

        .info {
          flex: 1;
          min-width: 0;
        }

        .title {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 ${theme.space[4]} 0;
          color: ${theme.text};
          line-height: 1.1;
          letter-spacing: -0.03em;
        }

        .badges {
          display: flex;
          gap: ${theme.space[2]};
          margin-bottom: ${theme.space[4]};
          flex-wrap: wrap;
        }

        .badge {
          display: flex;
          align-items: center;
          gap: ${theme.space[1]};
          padding: ${theme.space[2]} ${theme.space[3]};
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
          border: 1px solid;
        }

        .badge.vision {
          background: ${theme.primary}15;
          color: ${theme.primary};
          border-color: ${theme.primary}30;
        }

        .badge.text-only {
          background: ${theme.backgroundTertiary};
          color: ${theme.textTertiary};
          border-color: ${theme.border};
        }

        .badge.price {
          background: ${theme.backgroundSecondary};
          color: ${theme.textSecondary};
          border-color: ${theme.border};
        }

        .meta {
          display: flex;
          gap: ${theme.space[4]};
          align-items: center;
          font-size: 0.875rem;
          color: ${theme.textTertiary};
        }

        .id {
          font-family: 'SF Mono', Monaco, monospace;
          background: ${theme.backgroundTertiary};
          padding: ${theme.space[1]} ${theme.space[2]};
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .date {
          display: flex;
          align-items: center;
          gap: ${theme.space[1]};
        }

        .content {
          display: flex;
          flex-direction: column;
          gap: ${theme.space[5]};
        }

        .section {
          background: ${theme.background};
          border-radius: 20px;
          padding: ${theme.space[6]};
          border: 1px solid ${theme.border};
          box-shadow: 0 4px 16px ${theme.shadow1};
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: ${theme.space[2]};
          font-size: 1.25rem;
          font-weight: 650;
          margin: 0 0 ${theme.space[4]} 0;
          color: ${theme.text};
        }

        .description {
          font-size: 1rem;
          line-height: 1.7;
          color: ${theme.textSecondary};
          margin: 0;
          white-space: pre-wrap;
        }

        .tags {
          display: flex;
          gap: ${theme.space[2]};
          flex-wrap: wrap;
        }

        .tag {
          background: ${theme.backgroundTertiary};
          color: ${theme.textSecondary};
          padding: ${theme.space[2]} ${theme.space[3]};
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 550;
          border: 1px solid ${theme.border};
          transition: all 0.2s ease;
        }

        .tag:hover {
          background: ${theme.backgroundSelected};
          color: ${theme.text};
        }

        .details {
          display: grid;
          gap: ${theme.space[4]};
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }

        .detail {
          display: flex;
          flex-direction: column;
          gap: ${theme.space[1]};
        }

        .label {
          font-size: 0.75rem;
          font-weight: 600;
          color: ${theme.textTertiary};
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .value {
          font-size: 0.9rem;
          color: ${theme.textSecondary};
          font-family: 'SF Mono', Monaco, monospace;
          font-weight: 500;
        }

        .actions {
          position: sticky;
          bottom: ${theme.space[3]};
          background: ${theme.background};
          border: 1px solid ${theme.border};
          border-radius: 20px;
          padding: ${theme.space[4]};
          display: flex;
          gap: ${theme.space[3]};
          box-shadow: 0 8px 32px ${theme.shadow2};
          backdrop-filter: blur(16px);
        }

        .primary-action {
          flex: 1;
        }

        .secondary-actions {
          display: flex;
          gap: ${theme.space[2]};
        }

        .loading, .error {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: ${theme.space[4]};
          padding: ${theme.space[12]};
          text-align: center;
          background: ${theme.background};
          border-radius: 20px;
          border: 1px solid ${theme.border};
        }

        .skeleton {
          background: linear-gradient(90deg, ${theme.backgroundTertiary} 25%, ${theme.backgroundSecondary} 50%, ${theme.backgroundTertiary} 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 12px;
        }

        .header-skeleton { height: 160px; margin-bottom: ${theme.space[5]}; }
        .content-skeleton { height: 240px; margin-bottom: ${theme.space[5]}; }
        .actions-skeleton { height: 80px; }

        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 768px) {
          .hero-content {
            flex-direction: column;
            text-align: center;
            gap: ${theme.space[4]};
          }

          .title {
            font-size: 2rem;
          }

          .actions {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            border-radius: 0;
            border-left: 0;
            border-right: 0;
            border-bottom: 0;
            margin: 0;
          }

          .container {
            padding-bottom: 100px;
          }
        }

        @media (max-width: 480px) {
          .actions {
            flex-direction: column;
          }
          
          .secondary-actions {
            justify-content: stretch;
          }
          
          .secondary-actions > * {
            flex: 1;
          }

          .details {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AgentPage;
