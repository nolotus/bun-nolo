import { memo, useState, useEffect } from "react";
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

const LoadingState = memo(() => {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <SyncIcon className="loading-spinner" size={32} />
        <span className="loading-text">正在加载广场...</span>
      </div>
      <style href="public-agents-loading" precedence="default">{`
        .loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          width: 100%;
          min-height: 300px;
        }
        .loading-content {
           display: flex;
           flex-direction: column;
           align-items: center;
           gap: 16px;
           color: var(--textSecondary);
        }
        .loading-spinner {
          color: var(--primary);
          animation: spin 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .loading-text {
            font-size: 0.9rem;
            font-weight: 500;
            opacity: 0.8;
            animation: pulse 2s ease-in-out infinite;
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
      `}</style>
    </div>
  );
});
LoadingState.displayName = "LoadingState";

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

  return (
    <div className="agents-container">
      {/* 顶部控制栏 */}
      <div className="agents-controls-bar">
        <div className="search-area">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            onSearch={() => setDebouncedSearchTerm(searchTerm)}
            onClear={() => {
              setSearchTerm("");
              setDebouncedSearchTerm("");
            }}
            placeholder="搜索 AI 助手..."
            className="custom-search"
          />
        </div>

        <div className="sort-group">
          <span className="sort-label">排序:</span>
          <button
            className={`sort-pill ${sortBy === "newest" ? "active" : ""}`}
            onClick={() => setSortBy("newest")}
          >
            最新发布
          </button>
          <button
            className={`sort-pill ${sortBy?.includes("Price") ? "active" : ""}`}
            onClick={handlePriceSortClick}
          >
            <span>价格</span>
            <span className="sort-icon">
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
      <div className="agents-grid-wrapper">
        {loading && !data.length ? (
          <LoadingState />
        ) : data.length > 0 ? (
          <div className="agents-grid">
            {data.map((item) => (
              <AgentBlock key={item.id} item={item} reload={handleReload} />
            ))}
          </div>
        ) : (
          <div className="empty-state">暂无相关助手，换个关键词试试？</div>
        )}

        {loading && data.length > 0 && (
          <div className="loading-more-bar">
            <SyncIcon className="animate-spin" size={16} />
            <span>加载更多...</span>
          </div>
        )}
      </div>

      <style href="public-agents-styles" precedence="default">{`
        :root {
           --control-height: 40px;
        }

        .agents-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .agents-controls-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding-bottom: 4px;
        }

        .search-area {
          flex: 1;
          max-width: 400px;
        }
        
        /* 适配新版 SearchInput */
        :global(.custom-search .search-input) {
             height: var(--control-height);
             border-radius: 20px;
        }

        .sort-group {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--backgroundSecondary);
          padding: 4px;
          border-radius: 9999px;
          height: var(--control-height);
        }
        
        .sort-label {
            font-size: 0.85rem;
            color: var(--textTertiary);
            margin-left: 12px;
            margin-right: 4px;
            font-weight: 500;
        }

        .sort-pill {
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

        .sort-pill:hover:not(.active) {
          color: var(--text);
          background: rgba(0,0,0,0.03);
        }

        .sort-pill.active {
          background: var(--background);
          color: var(--primary);
          box-shadow: 0 2px 6px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04);
          font-weight: 600;
        }

        .sort-icon { display: flex; align-items: center; height: 14px; }
        .agents-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
        .empty-state { text-align: center; padding: 40px; color: var(--textTertiary); font-size: 0.95rem; }
        .loading-more-bar { display: flex; justify-content: center; align-items: center; gap: 8px; padding: 24px 0; color: var(--textTertiary); font-size: 0.9rem; }
        .animate-spin { animation: spin 1s linear infinite; }

        @media (max-width: 768px) {
          .agents-controls-bar { flex-direction: column; align-items: stretch; gap: 12px; }
          .search-area { max-width: 100%; }
          .sort-group { justify-content: space-between; width: 100%; }
          .sort-label { display: none; }
          .sort-pill { flex: 1; justify-content: center; }
          .agents-grid { grid-template-columns: 1fr; gap: 16px; }
        }
      `}</style>
    </div>
  );
});
PublicAgents.displayName = "PublicAgents";

export default PublicAgents;
