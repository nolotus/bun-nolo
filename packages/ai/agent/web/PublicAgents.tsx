import { memo, useState, useEffect, useMemo } from "react";
import { SyncIcon, ArrowUpIcon, ArrowDownIcon } from "@primer/octicons-react";
import {
  usePublicAgents,
  UsePublicAgentsOptions,
} from "ai/agent/hooks/usePublicAgents";
import AgentBlock from "ai/agent/web/AgentBlock";
import toast from "react-hot-toast";
import SearchInput from "render/web/ui/SearchInput";

interface PublicAgentsProps {
  limit?: number;
}

const SKELETON_COUNT = 6;

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

const PublicAgents = memo(({ limit = 20 }: PublicAgentsProps) => {
  const [sortBy, setSortBy] =
    useState<UsePublicAgentsOptions["sortBy"]>("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const { loading, error, data, reload } = usePublicAgents({
    limit,
    sortBy,
    searchName: debouncedSearchTerm,
  });

  const handleReload = async () => {
    await reload();
  };

  const handlePriceSortClick = () => {
    setSortBy((prev) =>
      prev === "outputPriceAsc" ? "outputPriceDesc" : "outputPriceAsc"
    );
  };

  if (error) {
    toast.error("加载列表失败");
    return null;
  }

  const hasData = data && data.length > 0;

  return (
    <div className="public-agents">
      {/* 顶部控制栏 */}
      <div className="public-agents__controls">
        <div className="public-agents__search">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            onSearch={() => setDebouncedSearchTerm(searchTerm)}
            onClear={() => {
              setSearchTerm("");
              setDebouncedSearchTerm("");
            }}
            placeholder="搜索 AI 助手..."
            className="public-agents__search-input"
          />
        </div>

        <div className="public-agents__sort">
          <span className="public-agents__sort-label">排序:</span>
          <button
            className={
              "public-agents__sort-pill" +
              (sortBy === "newest" ? " public-agents__sort-pill--active" : "")
            }
            onClick={() => setSortBy("newest")}
          >
            最新发布
          </button>
          <button
            className={
              "public-agents__sort-pill" +
              (sortBy?.includes("Price")
                ? " public-agents__sort-pill--active"
                : "")
            }
            onClick={handlePriceSortClick}
          >
            <span>价格</span>
            <span className="public-agents__sort-icon">
              {sortBy === "outputPriceAsc" && <ArrowUpIcon size={14} />}
              {sortBy === "outputPriceDesc" && <ArrowDownIcon size={14} />}
              {!sortBy?.includes("Price") && (
                <ArrowUpIcon size={14} style={{ opacity: 0.3 }} />
              )}
            </span>
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="public-agents__list-wrapper">
        {loading && !hasData ? (
          <PublicAgentsSkeleton />
        ) : hasData ? (
          <div className="public-agents__list">
            {data.map((item) => (
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
      </div>

      <style href="public-agents-styles" precedence="default">{`
        :root {
          --public-agents-control-height: 40px;
          --public-agents-skeleton-bg: var(--backgroundSecondary);
          --public-agents-skeleton-highlight: rgba(255, 255, 255, 0.5);
        }

        .public-agents {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* 顶部控制栏 */
        .public-agents__controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding-bottom: 4px;
        }

        .public-agents__search {
          flex: 1;
          max-width: 400px;
        }

        /* 适配新版 SearchInput */
        :global(.public-agents__search-input .search-input) {
          height: var(--public-agents-control-height);
          border-radius: 20px;
        }

        .public-agents__sort {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--backgroundSecondary);
          padding: 4px;
          border-radius: 9999px;
          height: var(--public-agents-control-height);
        }

        .public-agents__sort-label {
          font-size: 0.85rem;
          color: var(--textTertiary);
          margin-left: 12px;
          margin-right: 4px;
          font-weight: 500;
        }

        .public-agents__sort-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          height: 100%;
          padding: 0 16px;
          border-radius: 9999px;
          border: none;
          background: transparent;
          color: var(--textSecondary);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
          white-space: nowrap;
        }

        .public-agents__sort-pill:hover:not(.public-agents__sort-pill--active) {
          color: var(--text);
          background: rgba(0, 0, 0, 0.03);
        }

        .public-agents__sort-pill--active {
          background: var(--background);
          color: var(--primary);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08),
            0 1px 2px rgba(0, 0, 0, 0.04);
          font-weight: 600;
        }

        .public-agents__sort-icon {
          display: flex;
          align-items: center;
          height: 14px;
        }

        /* 列表区域（flex 布局） */
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

        /* 响应式 */
        @media (max-width: 768px) {
          .public-agents__controls {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .public-agents__search {
            max-width: 100%;
          }

          .public-agents__sort {
            justify-content: space-between;
            width: 100%;
          }

          .public-agents__sort-label {
            display: none;
          }

          .public-agents__sort-pill {
            flex: 1;
            justify-content: center;
          }

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
});
PublicAgents.displayName = "PublicAgents";

export default PublicAgents;
