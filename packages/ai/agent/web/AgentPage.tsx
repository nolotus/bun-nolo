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

// UI Components
import Button from "render/web/ui/Button";
import { Dialog } from "render/web/ui/Dialog";
import Avatar from "render/web/ui/Avatar";
import AgentForm from "ai/llm/web/AgentForm";

// Icons
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
  LuCoins,
} from "react-icons/lu";

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
      toast.success(t("deleteSuccess", "删除成功"));
      // 考虑删除后跳转回列表页
      // navigate('/agents');
    } catch (err) {
      setDeleting(false);
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error(`${t("deleteError", "删除失败")}: ${errorMessage}`);
    }
  }, [item, agentKey, deleting, dispatch, t]);

  const startDialog = useCallback(async () => {
    if (dialogLoading) return;
    try {
      await createNewDialog({ agents: [agentKey] });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      toast.error(`${t("createDialogError", "创建对话失败")}: ${errorMessage}`);
    }
  }, [dialogLoading, createNewDialog, agentKey, t]);

  if (isLoading) {
    return (
      <div className="agent-page">
        <div className="agent-page__container agent-page__state-indicator">
          <div className="agent-page__skeleton agent-page__skeleton--header" />
          <div className="agent-page__skeleton agent-page__skeleton--content" />
          <div className="agent-page__skeleton agent-page__skeleton--actions" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="agent-page">
        <div className="agent-page__container agent-page__state-indicator">
          <h2>{t("loadError", "加载失败")}</h2>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="agent-page">
      <div className="agent-page__container">
        {/* Header */}
        <header className="agent-page__header">
          <div className="agent-page__avatar">
            <Avatar name={item.name} type="agent" size="xlarge" />
          </div>
          <div className="agent-page__info">
            <h1 className="agent-page__name">
              {item.name || t("unnamed", "未命名")}
            </h1>
            {item.createdAt && (
              <div className="agent-page__meta">
                <LuCalendarDays size={14} />
                {t("createdAt", "创建于")}{" "}
                {format(new Date(item.createdAt), "yyyy-MM-dd")}
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="agent-page__content">
          <section className="agent-page__section">
            <p className="agent-page__description">
              {item.introduction || t("noIntroduction", "暂无简介。")}
            </p>
          </section>

          <section className="agent-page__section">
            <div className="agent-page__details-grid">
              <div className="agent-page__detail-item">
                <span className="agent-page__detail-label">
                  <LuCpu size={14} /> {t("model", "模型")}
                </span>
                <span className="agent-page__detail-value">
                  {item.model || t("notSpecified", "未指定")}
                </span>
              </div>
              <div className="agent-page__detail-item">
                <span className="agent-page__detail-label">
                  <LuEye size={14} /> {t("vision", "视觉能力")}
                </span>
                <span className="agent-page__detail-value">
                  {item.hasVision
                    ? t("supported", "支持")
                    : t("notSupported", "不支持")}
                </span>
              </div>
              {item.outputPrice && (
                <div className="agent-page__detail-item">
                  <span className="agent-page__detail-label">
                    <LuCoins size={14} /> {t("price", "价格")}
                  </span>
                  <span className="agent-page__detail-value">
                    {item.outputPrice.toFixed(2)} /{" "}
                    {t("perMillionTokens", "百万Tokens")}
                  </span>
                </div>
              )}
            </div>
          </section>

          {item.tags && item.tags.length > 0 && (
            <section className="agent-page__section">
              <div className="agent-page__detail-item">
                <span className="agent-page__detail-label">
                  <LuTag size={14} /> {t("tags", "标签")}
                </span>
                <div className="agent-page__tags">
                  {item.tags.map((tag, i) => (
                    <span key={i} className="agent-page__tag">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>

        {/* Actions */}
        <footer className="agent-page__footer">
          <Button
            icon={<LuMessageSquare size={16} />}
            onClick={startDialog}
            disabled={dialogLoading}
            loading={dialogLoading}
            size="large"
            className="agent-page__primary-action"
          >
            {dialogLoading
              ? t("starting", "启动中...")
              : t("startChat", "开始对话")}
          </Button>

          {allowEdit && (
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
                disabled={deleting}
                loading={deleting}
                variant="danger"
                size="large"
              />
            </div>
          )}
        </footer>
      </div>

      {editVisible && (
        <Dialog
          isOpen={editVisible}
          onClose={closeEdit}
          title={`${t("edit", "编辑")} ${item.name || t("agent", "智能体")}`}
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

        .agent-page__avatar {
          flex-shrink: 0;
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
          white-space: pre-wrap;
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
          .agent-page {
            padding: var(--space-3) var(--space-2);
          }
          .agent-page__container {
            padding: var(--space-4);
            gap: var(--space-4);
          }
          .agent-page__header {
            flex-direction: column;
            align-items: flex-start;
          }
        }
        
        @media (max-width: 480px) {
            .agent-page__footer {
              flex-direction: column;
              gap: var(--space-2);
            }
            .agent-page__secondary-actions {
              display: grid;
              grid-template-columns: 1fr 1fr;
            }
        }
      `}</style>
    </div>
  );
};

export default AgentPage;
