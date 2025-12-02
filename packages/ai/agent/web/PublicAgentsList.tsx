import { memo, useMemo } from "react";
import { SyncIcon } from "@primer/octicons-react";
import AgentBlock from "ai/agent/web/AgentBlock";

const SKELETON_COUNT = 6;

interface PublicAgentsListProps {
  loading: boolean;
  data?: any[]; // 这里你可以根据 usePublicAgents 的返回类型，替换为更精确的类型
  reload: () => Promise<void> | void;
}

/**
 * 骨架屏列表
 */
const PublicAgentsSkeleton = memo(() => {
  const items = useMemo(() => Array.from({ length: SKELETON_COUNT }), []);

  return (
    <div className="public-agents__skeleton-list">
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
 * 列表 & 骨架屏 & 空状态 & 加载更多
 */
const PublicAgentsList = memo(
  ({ loading, data, reload }: PublicAgentsListProps) => {
    const hasData = data && data.length > 0;

    const handleReload = async () => {
      await reload();
    };

    return (
      <div className="public-agents__list-wrapper">
        {loading && !hasData ? (
          <PublicAgentsSkeleton />
        ) : hasData ? (
          <div className="public-agents__list">
            {data!.map((item: any) => (
              <AgentBlock key={item.id} item={item} reload={handleReload} />
            ))}
          </div>
        ) : (
          <div className="public-agents__empty">
            暂无相关助手，换个关键词试试？
          </div>
        )}

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
          .public-agents__list-wrapper {
            width: 100%;
          }

          .public-agents__list {
            display: flex;
            flex-wrap: wrap;
            gap: 24px;
          }

          .public-agents__list > * {
            flex: 1 1 300px; /* 最小 300px，按行自动折行 */
            max-width: 100%;
          }

          .public-agents__empty {
            text-align: center;
            padding: 40px;
            color: var(--textTertiary);
            font-size: 0.95rem;
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

          /* 骨架屏 */
          .public-agents__skeleton-list {
            display: flex;
            flex-wrap: wrap;
            gap: 24px;
          }

          .public-agents__skeleton-card {
            flex: 1 1 300px;
            max-width: 100%;
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
            background: linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.08),
              rgba(255, 255, 255, 0.18),
              rgba(255, 255, 255, 0.08)
            );
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
            background: linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.06),
              rgba(255, 255, 255, 0.18),
              rgba(255, 255, 255, 0.06)
            );
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
            background: linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.06),
              rgba(255, 255, 255, 0.2),
              rgba(255, 255, 255, 0.06)
            );
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

          /* 响应式（列表和骨架相关部分） */
          @media (max-width: 768px) {
            .public-agents__list {
              flex-direction: column;
              gap: 16px;
            }

            .public-agents__list > * {
              flex: 1 1 100%;
            }

            .public-agents__skeleton-list {
              flex-direction: column;
              gap: 16px;
            }

            .public-agents__skeleton-card {
              flex: 1 1 100%;
            }
          }
        `}</style>
      </div>
    );
  }
);
PublicAgentsList.displayName = "PublicAgentsList";

export default PublicAgentsList;
