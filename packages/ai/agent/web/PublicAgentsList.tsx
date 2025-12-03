import { memo, useMemo } from "react";
import { SyncIcon } from "@primer/octicons-react";
import AgentBlock from "ai/agent/web/AgentBlock";

const SKELETON_COUNT = 6;

interface PublicAgentsListProps {
  loading: boolean;
  data?: any[]; // TODO: 可替换为 usePublicAgents 返回的精确类型
  reload: () => Promise<void> | void;
}

/**
 * 骨架屏列表（使用与正式列表相同的 Grid 容器）
 */
const PublicAgentsSkeleton = memo(() => {
  const items = useMemo(() => Array.from({ length: SKELETON_COUNT }), []);

  return (
    <div className="public-agents__grid">
      {items.map((_, index) => (
        <div key={index} className="public-agents__skeleton-card">
          <div className="public-agents__skeleton-header">
            <div className="public-agents__skeleton-avatar" />
            <div className="public-agents__skeleton-header-text">
              <div className="public-agents__skeleton-line public-agents__skeleton-line--title" />
              <div className="public-agents__skeleton-line public-agents__skeleton-line--subtitle" />
            </div>
          </div>

          <div className="public-agents__skeleton-body">
            <div className="public-agents__skeleton-line" />
            <div className="public-agents__skeleton-line" />
            <div className="public-agents__skeleton-line public-agents__skeleton-line--short" />
          </div>

          <div className="public-agents__skeleton-footer">
            <div className="public-agents__skeleton-pill" />
            <div className="public-agents__skeleton-pill public-agents__skeleton-pill--small" />
          </div>
        </div>
      ))}
    </div>
  );
});
PublicAgentsSkeleton.displayName = "PublicAgentsSkeleton";

/**
 * 列表 & 骨架屏 & 加载更多
 *
 * 注意：
 * 1. PublicAgentsList 业务上「不可能出现空状态」，因此这里**故意不渲染任何空状态 UI**。
 *    不要在此处再添加「暂无数据」之类的分支。
 */
const PublicAgentsList = memo(
  ({ loading, data, reload }: PublicAgentsListProps) => {
    const hasData = !!data && data.length > 0;

    return (
      <div className="public-agents__list-wrapper">
        {/* 首屏加载骨架（无数据时） */}
        {loading && !hasData && <PublicAgentsSkeleton />}

        {/* 有数据时的主列表（Grid 布局） */}
        {hasData && (
          <div className="public-agents__grid">
            {data!.map((item: any) => (
              <AgentBlock key={item.id} item={item} reload={reload} />
            ))}
          </div>
        )}

        {/* 加载更多状态：底部 Loading 提示 */}
        {loading && hasData && (
          <div className="public-agents__loading-more">
            <SyncIcon
              className="public-agents__icon public-agents__icon--spin"
              size={16}
            />
            <span>加载更多...</span>
          </div>
        )}

        <style href="public-agents-list-styles" precedence="default">{`
          :root {
            --public-agents-skeleton-bg: var(--backgroundSecondary);
            --public-agents-skeleton-shimmer: linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.06),
              rgba(255, 255, 255, 0.2),
              rgba(255, 255, 255, 0.06)
            );
          }

          .public-agents__list-wrapper {
            width: 100%;
          }

          /* 
            重要：默认情况（桌面端宽度）每行固定显示 3 个卡片。
            这是产品需求，请不要改成 auto-fill / auto-fit 等自适应列数。
          */
          .public-agents__grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr)); /* 默认每行 3 个 */
            gap: var(--space-4, 16px);
            align-items: stretch;
          }

          .public-agents__loading-more {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 8px;
            padding: 24px 0;
            color: var(--textTertiary);
            font-size: 0.9rem;
          }

          .public-agents__icon--spin {
            animation: public-agents-spin 1s linear infinite;
          }

          @keyframes public-agents-spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          /* 骨架卡片（直接占满 grid 单元格） */
          .public-agents__skeleton-card {
            padding: 16px;
            border-radius: 16px;
            background: var(--public-agents-skeleton-bg);
            overflow: hidden;
          }

          .public-agents__skeleton-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
          }

          .public-agents__skeleton-avatar {
            width: 40px;
            height: 40px;
            border-radius: 9999px;
            background: var(--public-agents-skeleton-shimmer);
            background-size: 200% 100%;
            animation: public-agents-skeleton-shimmer 1.4s linear infinite;
          }

          .public-agents__skeleton-header-text {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 6px;
          }

          .public-agents__skeleton-body {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 16px;
          }

          .public-agents__skeleton-footer {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .public-agents__skeleton-line {
            height: 10px;
            border-radius: 9999px;
            background: var(--public-agents-skeleton-shimmer);
            background-size: 200% 100%;
            animation: public-agents-skeleton-shimmer 1.4s linear infinite;
          }

          .public-agents__skeleton-line--title {
            width: 60%;
            height: 12px;
          }

          .public-agents__skeleton-line--subtitle {
            width: 40%;
          }

          .public-agents__skeleton-line--short {
            width: 50%;
          }

          .public-agents__skeleton-pill {
            height: 22px;
            width: 80px;
            border-radius: 9999px;
            background: var(--public-agents-skeleton-shimmer);
            background-size: 200% 100%;
            animation: public-agents-skeleton-shimmer 1.4s linear infinite;
          }

          .public-agents__skeleton-pill--small {
            width: 60px;
          }

          @keyframes public-agents-skeleton-shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }

          /* 
            响应式说明：
            - 这里仅在小屏下从 3 列变为 2 列 / 1 列，方便阅读。
            - 但「默认情况」依然是 3 列，对应上面的业务注释。
          */
          @media (max-width: 1024px) {
            .public-agents__grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 600px) {
            .public-agents__grid {
              grid-template-columns: 1fr;
              gap: var(--space-3, 12px);
            }
          }
        `}</style>
      </div>
    );
  }
);

PublicAgentsList.displayName = "PublicAgentsList";

export default PublicAgentsList;
