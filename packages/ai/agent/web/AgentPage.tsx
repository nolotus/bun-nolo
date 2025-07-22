import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "app/store";
import { useFetchData } from "app/hooks";
import { useCouldEdit } from "auth/hooks/useCouldEdit";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { useModal } from "render/ui/Modal";
import { format } from "date-fns";
import toast from "react-hot-toast";

import {
  LuPlus,
  LuRefreshCw,
  LuMessageSquare,
  LuPencil,
  LuTrash2,
  LuEye,
  LuCalendarDays,
  LuTag,
  LuCpu,
  LuEyeOff,
  LuJapaneseYen,
} from "react-icons/lu";

import Button from "render/web/ui/Button";
import { Dialog } from "render/web/ui/Dialog";
import Avatar from "render/web/ui/Avatar";
import AgentForm from "ai/llm/web/AgentForm";
import { Agent } from "app/types";
import { remove } from "database/dbSlice";

interface AgentPageProps {
  agentKey: string;
}

const AgentPage = ({ agentKey }: AgentPageProps) => {
  const { t } = useTranslation("ai");
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
    } catch (err) {
      setDeleting(false);
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error(`${t("deleteError")}: ${errorMessage}`);
    }
  }, [item, agentKey, deleting, dispatch, t]);

  const startDialog = useCallback(async () => {
    if (dialogLoading) return;
    try {
      await createNewDialog({ agents: [agentKey] });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error(`${t("createDialogError")}: ${errorMessage}`);
    }
  }, [dialogLoading, createNewDialog, agentKey, t]);

  if (isLoading) {
    return (
      <div className="agent-page">
        <div className="agent-page__container">
          <div className="agent-page__state-indicator">
            <div className="agent-page__skeleton agent-page__skeleton--header" />
            <div className="agent-page__skeleton agent-page__skeleton--content" />
            <div className="agent-page__skeleton agent-page__skeleton--actions" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="agent-page">
        <div className="agent-page__container">
          <div className="agent-page__state-indicator">
            <h2>{t("loadError")}</h2>
            <p>{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="agent-page">
      <div className="agent-page__container">
        {/* Hero section */}
        <header className="agent-page__hero">
          <div className="agent-page__hero-content">
            <div className="agent-page__avatar">
              <Avatar name={item.name} type="agent" size="xlarge" />
            </div>

            <div className="agent-page__info">
              <h1 className="agent-page__name">{item.name || t("unnamed")}</h1>

              <div className="agent-page__badges">
                {item.hasVision ? (
                  <span className="agent-page__badge agent-page__badge--vision">
                    <LuEye size={14} />
                    {t("vision")}
                  </span>
                ) : (
                  <span className="agent-page__badge agent-page__badge--text-only">
                    <LuEyeOff size={14} />
                    {t("textOnly")}
                  </span>
                )}

                {item.outputPrice && (
                  <span className="agent-page__badge agent-page__badge--price">
                    <LuJapaneseYen size={12} />
                    {item.outputPrice.toFixed(2)} / {t("perMillionTokens")}
                  </span>
                )}
              </div>

              <div className="agent-page__meta">
                {item.createdAt && (
                  <span className="agent-page__date">
                    <LuCalendarDays size={14} />
                    {format(new Date(item.createdAt), "yyyy-MM-dd")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content sections */}
        <main className="agent-page__content">
          {item.introduction && (
            <section className="agent-page__section">
              <h2 className="agent-page__section-title">
                <LuCpu size={18} />
                {t("introduction")}
              </h2>
              <p className="agent-page__description">{item.introduction}</p>
            </section>
          )}

          {item.tags?.length > 0 && (
            <section className="agent-page__section">
              <h2 className="agent-page__section-title">
                <LuTag size={18} />
                {t("tags")}
              </h2>
              <div className="agent-page__tags">
                {item.tags.map((tag, i) => (
                  <span key={i} className="agent-page__tag">
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="agent-page__section">
            <h2 className="agent-page__section-title">{t("details")}</h2>
            <div className="agent-page__details-grid">
              <div className="agent-page__detail-item">
                <span className="agent-page__detail-label">{t("model")}</span>
                <span className="agent-page__detail-value">
                  {item.model || t("notSpecified")}
                </span>
              </div>
            </div>
          </section>
        </main>

        {/* Actions */}
        <footer className="agent-page__actions-footer">
          <Button
            icon={<LuMessageSquare size={16} />}
            onClick={startDialog}
            disabled={dialogLoading}
            loading={dialogLoading}
            size="large"
            className="agent-page__primary-action"
          >
            {dialogLoading ? t("starting") : t("startChat")}
          </Button>

          {allowEdit && (
            <div className="agent-page__secondary-actions">
              <Button
                icon={<LuPencil size={16} />}
                onClick={openEdit}
                variant="secondary"
                size="large"
              >
                {t("edit")}
              </Button>
              <Button
                icon={<LuTrash2 size={16} />}
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
        </footer>
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
            CreateIcon={LuPlus}
            EditIcon={LuRefreshCw}
          />
        </Dialog>
      )}

      <style href="agent-page" precedence="medium">{`
        .agent-page {
          min-height: 100vh;
          background: var(--backgroundSecondary);
          padding: var(--space-4);
        }

        .agent-page__container {
          max-width: 720px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .agent-page__hero {
          background: var(--background);
          border-radius: 24px;
          padding: var(--space-8);
          border: 1px solid var(--border);
          box-shadow: 0 8px 32px var(--shadowMedium);
          position: relative;
          overflow: hidden;
        }

        .agent-page__hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 120px;
          background: linear-gradient(135deg, var(--primaryGhost) 0%, transparent 70%);
          pointer-events: none;
        }

        .agent-page__hero-content {
          position: relative;
          display: flex;
          align-items: center;
          gap: var(--space-6);
        }

        .agent-page__avatar {
          flex-shrink: 0;
          position: relative;
        }

        .agent-page__avatar::after {
          content: '';
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary)20 0%, transparent 60%);
          opacity: 0.6;
          z-index: -1;
        }

        .agent-page__info {
          flex: 1;
          min-width: 0;
        }

        .agent-page__name {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 var(--space-4) 0;
          color: var(--text);
          line-height: 1.1;
          letter-spacing: -0.03em;
        }

        .agent-page__badges {
          display: flex;
          gap: var(--space-2);
          margin-bottom: var(--space-4);
          flex-wrap: wrap;
        }

        .agent-page__badge {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-2) var(--space-3);
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
          border: 1px solid;
          white-space: nowrap;
        }

        .agent-page__badge--vision {
          background: var(--primaryBg);
          color: var(--primary);
          border-color: var(--borderAccent);
        }

        .agent-page__badge--text-only {
          background: var(--backgroundTertiary);
          color: var(--textTertiary);
          border-color: var(--border);
        }

        .agent-page__badge--price {
          background: var(--backgroundSecondary);
          color: var(--textSecondary);
          border-color: var(--border);
        }

        .agent-page__meta {
          display: flex;
          gap: var(--space-4);
          align-items: center;
          font-size: 0.875rem;
          color: var(--textTertiary);
          justify-content: flex-start; /* Aligns items to the start */
          min-height: 24px; /* Ensures consistent height even when empty */
        }

        .agent-page__date {
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }

        .agent-page__content {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .agent-page__section {
          background: var(--background);
          border-radius: 20px;
          padding: var(--space-6);
          border: 1px solid var(--border);
          box-shadow: 0 4px 16px var(--shadowLight);
        }

        .agent-page__section-title {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 1.25rem;
          font-weight: 650;
          margin: 0 0 var(--space-4) 0;
          color: var(--text);
        }

        .agent-page__description {
          font-size: 1rem;
          line-height: 1.7;
          color: var(--textSecondary);
          margin: 0;
          white-space: pre-wrap;
        }

        .agent-page__tags {
          display: flex;
          gap: var(--space-2);
          flex-wrap: wrap;
        }

        .agent-page__tag {
          background: var(--backgroundTertiary);
          color: var(--textSecondary);
          padding: var(--space-2) var(--space-3);
          border-radius: 10px;
          font-size: 0.875rem;
          font-weight: 550;
          border: 1px solid var(--border);
          transition: all 0.2s ease;
        }

        .agent-page__tag:hover {
          background: var(--backgroundHover);
          color: var(--text);
        }

        .agent-page__details-grid {
          display: grid;
          gap: var(--space-4);
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        }

        .agent-page__detail-item {
          display: flex;
          flex-direction: column;
          gap: var(--space-1);
        }

        .agent-page__detail-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--textTertiary);
          text-transform: uppercase;
          letter-spacing:  0.08em;
        }

        .agent-page__detail-value {
          font-size: 0.9rem;
          color: var(--textSecondary);
          font-family: 'SF Mono', Monaco, monospace;
          font-weight: 500;
          text-transform: capitalize;
        }

        .agent-page__actions-footer {
          position: sticky;
          bottom: var(--space-4);
          background: var(--backgroundGhost);
          border: 1px solid var(--border);
          border-radius: 20px;
          padding: var(--space-4);
          display: flex;
          gap: var(--space-3);
          box-shadow: 0 8px 32px var(--shadowMedium);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }

        .agent-page__primary-action {
          flex: 1;
        }

        .agent-page__secondary-actions {
          display: flex;
          gap: var(--space-2);
        }

        .agent-page__state-indicator {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          justify-content: center;
          gap: var(--space-4);
          padding: var(--space-12) var(--space-4);
          text-align: center;
          background: var(--background);
          border-radius: 20px;
          border: 1px solid var(--border);
          min-height: 50vh;
        }

        .agent-page__skeleton {
          width: 100%;
          background: linear-gradient(90deg, var(--backgroundTertiary) 25%, var(--backgroundSecondary) 50%, var(--backgroundTertiary) 75%);
          background-size: 200% 100%;
          animation: agent-page-loading 1.5s infinite;
          border-radius: 12px;
        }

        .agent-page__skeleton--header { height: 160px; margin-bottom: var(--space-5); }
        .agent-page__skeleton--content { height: 240px; margin-bottom: var(--space-5); }
        .agent-page__skeleton--actions { height: 60px; }

        @keyframes agent-page-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 768px) {
          .agent-page__hero-content {
            flex-direction: column;
            text-align: center;
            gap: var(--space-4);
          }
          
          .agent-page__name {
            font-size: 2rem;
          }

          .agent-page__meta {
            justify-content: center; /* Center the date when in column layout */
          }

          .agent-page__actions-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            border-radius: 0;
            border-left: 0;
            border-right: 0;
            border-bottom: 0;
            padding: var(--space-3);
            z-index: 10;
          }

          .agent-page__container {
            padding-bottom: 120px;
          }
        }

        @media (max-width: 480px) {
          .agent-page__actions-footer {
            flex-direction: column;
          }

          .agent-page__secondary-actions {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .agent-page__details-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AgentPage;
