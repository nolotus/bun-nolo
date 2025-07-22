import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppDispatch } from "app/store";
import { useFetchData } from "app/hooks";
import { useCouldEdit } from "auth/hooks/useCouldEdit";
import { useCreateDialog } from "chat/dialog/useCreateDialog";
import { useModal } from "render/ui/Modal";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Agent } from "app/types";
import { remove } from "database/dbSlice";

// UI Components & Icons
import Button from "render/web/ui/Button";
import { Dialog } from "render/web/ui/Dialog";
import Avatar from "render/web/ui/Avatar";
import AgentForm from "ai/llm/web/AgentForm";
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
  LuCoins,
} from "react-icons/lu";

// --- 辅助组件定义 ---

const PageStateIndicator = ({ isLoading, error, t }) => (
  <div className="agent-page__container agent-page__state-indicator">
    {isLoading ? (
      <>
        <div className="agent-page__skeleton agent-page__skeleton--header" />
        <div className="agent-page__skeleton agent-page__skeleton--content" />
        <div className="agent-page__skeleton agent-page__skeleton--actions" />
      </>
    ) : (
      <>
        <h2>{t("loadError")}</h2>
        <p>{error.message}</p>
      </>
    )}
  </div>
);

const DetailItem = ({ icon, label, children }) => (
  <div className="agent-page__detail-item">
    <span className="agent-page__detail-label">
      {icon}
      {label}
    </span>
    <div className="agent-page__detail-value">{children}</div>
  </div>
);

// --- 主组件 ---

interface AgentPageProps {
  agentKey: string;
}

const AgentPage = ({ agentKey }: AgentPageProps) => {
  const { t } = useTranslation("ai");
  const dispatch = useAppDispatch();
  const { isLoading: isDialogLoading, createNewDialog } = useCreateDialog();
  const {
    visible: isEditVisible,
    open: openEdit,
    close: closeEdit,
  } = useModal();
  const [isDeleting, setIsDeleting] = useState(false);
  const canEdit = useCouldEdit(agentKey);

  const { data: item, isLoading, error } = useFetchData<Agent>(agentKey);

  const handleDelete = useCallback(async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await dispatch(remove(agentKey));
      toast.success(t("deleteSuccess"));
    } catch (err) {
      toast.error(`${t("deleteError")}: ${err.message}`);
      setIsDeleting(false);
    }
  }, [agentKey, dispatch, isDeleting, t]);

  const startDialog = useCallback(async () => {
    if (isDialogLoading) return;
    try {
      await createNewDialog({ agents: [agentKey] });
    } catch (err) {
      toast.error(`${t("createDialogError")}: ${err.message}`);
    }
  }, [agentKey, createNewDialog, isDialogLoading, t]);

  const details = item
    ? [
        {
          key: "model",
          icon: <LuCpu size={14} />,
          label: t("model"),
          value: item.model || t("notSpecified"),
        },
        {
          key: "vision",
          icon: <LuEye size={14} />,
          label: t("vision"),
          value: item.hasVision ? t("supported") : t("notSupported"),
        },
        item.outputPrice && {
          key: "price",
          icon: <LuCoins size={14} />,
          label: t("price"),
          value: `${item.outputPrice.toFixed(2)} / ${t("perMillionTokens")}`,
        },
      ].filter(Boolean)
    : [];

  if (isLoading || error) {
    return (
      <div className="agent-page">
        <PageStateIndicator isLoading={isLoading} error={error} t={t} />
      </div>
    );
  }
  if (!item) return null;

  return (
    <>
      <div className="agent-page">
        <div className="agent-page__container">
          {/* Header */}
          <header className="agent-page__header">
            <Avatar name={item.name} type="agent" size="xlarge" />
            <div className="agent-page__info">
              <h1 className="agent-page__name">{item.name || t("unnamed")}</h1>
              <div className="agent-page__meta">
                <LuCalendarDays size={14} />
                {t("createdAt")}{" "}
                {format(new Date(item.createdAt), "yyyy-MM-dd")}
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="agent-page__content">
            <section className="agent-page__section">
              <p className="agent-page__description">
                {item.introduction || t("noIntroduction")}
              </p>
            </section>

            <section className="agent-page__section">
              <div className="agent-page__details-grid">
                {details.map((d) => (
                  <DetailItem key={d.key} icon={d.icon} label={d.label}>
                    {d.value}
                  </DetailItem>
                ))}
              </div>
            </section>

            {item.tags?.length > 0 && (
              <section className="agent-page__section">
                <DetailItem icon={<LuTag size={14} />} label={t("tags")}>
                  <div className="agent-page__tags">
                    {item.tags.map((tag, i) => (
                      <span key={i} className="agent-page__tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </DetailItem>
              </section>
            )}
          </main>

          {/* Footer Actions */}
          <footer className="agent-page__footer">
            <Button
              icon={<LuMessageSquare size={16} />}
              onClick={startDialog}
              disabled={isDialogLoading}
              loading={isDialogLoading}
              size="large"
              className="agent-page__primary-action"
            >
              {isDialogLoading ? t("starting") : t("startChat")}
            </Button>
            {canEdit && (
              <div className="agent-page__secondary-actions">
                <Button
                  icon={<LuPencil size={16} />}
                  onClick={openEdit}
                  variant="secondary"
                  size="large"
                />
                <Button
                  icon={<LuTrash2 size={16} />}
                  onClick={handleDelete}
                  disabled={isDeleting}
                  loading={isDeleting}
                  variant="danger"
                  size="large"
                />
              </div>
            )}
          </footer>
        </div>
      </div>

      {isEditVisible && (
        <Dialog
          isOpen={isEditVisible}
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
          padding: var(--space-6) var(--space-4);
          background: var(--backgroundSecondary);
        }
        .agent-page__container {
          max-width: 768px;
          margin: 0 auto;
          background: var(--background);
          border-radius: var(--space-4);
          border: 1px solid var(--border);
          padding: var(--space-6);
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }
        .agent-page__header {
          display: flex;
          align-items: center;
          gap: var(--space-5);
        }
        .agent-page__info {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          min-width: 0;
        }
        .agent-page__name {
          font-size: 1.8rem;
          font-weight: 650;
          margin: 0;
          color: var(--text);
          line-height: 1.2;
        }
        .agent-page__meta {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.875rem;
          color: var(--textTertiary);
        }
        .agent-page__content {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }
        .agent-page__section {
          padding-top: var(--space-5);
          border-top: 1px solid var(--border);
        }
        .agent-page__section:first-child {
          padding-top: 0;
          border-top: none;
        }
        .agent-page__description {
          font-size: 1rem;
          line-height: 1.7;
          color: var(--textSecondary);
          margin: 0;
          white-space: pre-wrap; /* 支持换行 */
          padding: var(--space-3) var(--space-4); /* 添加留白 */
          background: var(--backgroundSecondary); /* 添加背景以突出区域 */
          border-radius: var(--space-2); /* 圆角 */
        }
        .agent-page__details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-5);
        }
        .agent-page__detail-item {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .agent-page__detail-label {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.8rem;
          font-weight: 500;
          color: var(--textTertiary);
        }
        .agent-page__detail-value {
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text);
        }
        .agent-page__tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }
        .agent-page__tag {
          font-size: 0.8rem;
          padding: var(--space-1) var(--space-3);
          background: var(--backgroundTertiary);
          border-radius: var(--space-1);
          color: var(--textSecondary);
          font-weight: 500;
        }
        .agent-page__footer {
          display: flex;
          gap: var(--space-3);
          padding-top: var(--space-5);
          border-top: 1px solid var(--border);
        }
        .agent-page__primary-action {
          flex: 1;
        }
        .agent-page__secondary-actions {
          display: flex;
          gap: var(--space-2);
        }
        .agent-page__state-indicator {
          min-height: 60vh;
          align-items: center;
          justify-content: center;
          text-align: center;
        }
        .agent-page__skeleton {
          width: 100%;
          background: linear-gradient(90deg, var(--backgroundTertiary) 25%, var(--backgroundSecondary) 50%, var(--backgroundTertiary) 75%);
          background-size: 200% 100%;
          animation: agent-page-loading 1.5s infinite;
          border-radius: var(--space-2);
        }
        .agent-page__skeleton--header { height: 80px; max-width: 400px; }
        .agent-page__skeleton--content { height: 120px; max-width: 600px; }
        .agent-page__skeleton--actions { height: 48px; max-width: 400px; }
        @keyframes agent-page-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (max-width: 768px) {
          .agent-page { padding: var(--space-3) var(--space-2); }
          .agent-page__container { padding: var(--space-4); gap: var(--space-4); }
          .agent-page__header { flex-direction: column; align-items: flex-start; }
        }
        @media (max-width: 480px) {
          .agent-page__footer { flex-direction: column; gap: var(--space-2); }
          .agent-page__secondary-actions { display: grid; grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </>
  );
};

export default AgentPage;
