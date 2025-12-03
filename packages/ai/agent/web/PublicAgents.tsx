import { memo, useState, useEffect } from "react";
import { ArrowUpIcon, ArrowDownIcon } from "@primer/octicons-react";
import {
  usePublicAgents,
  UsePublicAgentsOptions,
} from "ai/agent/hooks/usePublicAgents";
import toast from "react-hot-toast";
import SearchInput from "render/web/ui/SearchInput";

import PublicAgentsList from "./PublicAgentsList";

interface PublicAgentsProps {
  limit?: number;
}

const DEBOUNCE_DELAY = 300; // 搜索防抖时间（ms）

const PublicAgents = memo(({ limit = 20 }: PublicAgentsProps) => {
  const [sortBy, setSortBy] =
    useState<UsePublicAgentsOptions["sortBy"]>("newest");

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  /**
   * 搜索关键字防抖
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { loading, error, data, reload } = usePublicAgents({
    limit,
    sortBy,
    searchName: debouncedSearchTerm,
  });

  /**
   * 切换为「最新发布」
   */
  const handleNewestSortClick = () => {
    setSortBy("newest");
  };

  /**
   * 切换价格排序：升序 <-> 降序
   */
  const handlePriceSortClick = () => {
    setSortBy((prev) =>
      prev === "outputPriceAsc" ? "outputPriceDesc" : "outputPriceAsc"
    );
  };

  const handleSearchClear = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
  };

  const handleSearchSubmit = () => {
    setDebouncedSearchTerm(searchTerm);
  };

  if (error) {
    toast.error("加载列表失败");
    return null;
  }

  return (
    <div className="public-agents">
      {/* 顶部控制栏 */}
      <div className="public-agents__controls">
        {/* 搜索框区域 */}
        <div className="public-agents__search">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            onSearch={handleSearchSubmit}
            onClear={handleSearchClear}
            placeholder="搜索 AI 助手..."
            className="public-agents__search-input"
          />
        </div>

        {/* 排序区域 */}
        <div className="public-agents__sort">
          <span className="public-agents__sort-label">排序:</span>

          <button
            type="button"
            className={
              "public-agents__sort-pill" +
              (sortBy === "newest" ? " public-agents__sort-pill--active" : "")
            }
            onClick={handleNewestSortClick}
          >
            最新发布
          </button>

          <button
            type="button"
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

      {/* 列表区域（布局由 PublicAgentsList 统一处理） */}
      <PublicAgentsList loading={loading} data={data} reload={reload} />

      <style href="public-agents-styles" precedence="default">{`
        :root {
          --public-agents-control-height: 40px;
        }

        .public-agents {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: var(--space-6, 24px);
        }

        /* 顶部控制栏 */
        .public-agents__controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: var(--space-4, 16px);
          padding-bottom: 4px;
        }

        .public-agents__search {
          flex: 1;
          max-width: 400px;
        }

        /* 适配新版 SearchInput 外壳 */
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
          box-shadow:
            0 2px 6px rgba(0, 0, 0, 0.08),
            0 1px 2px rgba(0, 0, 0, 0.04);
          font-weight: 600;
        }

        .public-agents__sort-icon {
          display: flex;
          align-items: center;
          height: 14px;
        }

        /* 控制栏响应式 */
        @media (max-width: 768px) {
          .public-agents__controls {
            flex-direction: column;
            align-items: stretch;
            gap: var(--space-3, 12px);
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
        }
      `}</style>
    </div>
  );
});

PublicAgents.displayName = "PublicAgents";

export default PublicAgents;
