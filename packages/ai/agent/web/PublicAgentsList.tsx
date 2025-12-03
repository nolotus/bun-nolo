import { memo, useMemo } from "react";
import { SyncIcon } from "@primer/octicons-react";
// 按实际路径修改：
import AgentListView from "./AgentListView";

const SKELETON_COUNT = 6;

interface PublicAgentsListProps {
  loading: boolean;
  data?: any[]; // TODO: 替换为具体 Agent 类型
  reload: () => Promise<void> | void;
}

/**
 * 骨架屏列表：使用与正式列表一致的「3 列 Grid」布局
 */
const PublicAgentsSkeleton = memo(() => {
  const items = useMemo(() => Array.from({ length: SKELETON_COUNT }), []);

  return (
    <div className="public-agents__skeleton-grid">
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
 * 重要业务约束：
 * 1. PublicAgentsList 业务上「不可能出现空状态」，因此这里**刻意不渲染空状态 UI**。
 *    不要在此处再添加「暂无数据」或类似分支。
 * 2. 真实列表的网格布局交给 AgentListView 处理，这里只负责骨架和加载更多。
 */
const PublicAgentsList = memo(
  ({ loading, data, reload }: PublicAgentsListProps) => {
    const hasData = !!data && data.length > 0;

    return (
      <div className="public-agents__list-wrapper">
        {/* 首屏加载：无数据时显示骨架 */}
        {loading && !hasData && <PublicAgentsSkeleton />}

        {/* 有数据：交给 AgentListView 渲染网格列表 */}
        {hasData && <AgentListView items={data!} onReload={reload} />}

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

          /* 
            骨架列表布局说明：
            - 这里的 skeleton grid 要与 AgentListView 中的 .cybots-grid 保持一致：
              默认 3 列，中屏 2 列，小屏 1 列。
            - 如需修改列数，请同时更新 AgentListView 与此处的样式。
          */
          .public-agents__skeleton-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr)); /* 默认每行 3 个 */
            gap: var(--space-5, 20px);
            align-items: stretch;
          }

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

          @media (max-width: 1024px) {
            .public-agents__skeleton-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }
          }

          @media (max-width: 600px) {
            .public-agents__skeleton-grid {
              grid-template-columns: 1fr;
              gap: var(--space-4, 16px);
            }
          }
        `}</style>
      </div>
    );
  }
);

PublicAgentsList.displayName = "PublicAgentsList";

export default PublicAgentsList;
