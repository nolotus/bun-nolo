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
      <div className="loading-spinner">
        <SyncIcon size={32} />
      </div>
      <style href="public-agents-loading" precedence="default">{`
        .loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-20) var(--space-6);
          min-height: 300px;
        }

        .loading-spinner {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .loading-spinner svg {
          color: var(--primary);
          opacity: 0.8;
          animation: spin 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .loading-spinner::before {
          content: '';
          position: absolute;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--primaryGhost);
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.3;
          }
          50% { 
            transform: scale(1.4);
            opacity: 0;
          }
        }
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

  // Debounce automatic search effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const { loading, error, data } = usePublicAgents({
    limit,
    sortBy,
    searchName: debouncedSearchTerm,
  });

  const handlePriceSortClick = () => {
    if (sortBy === "outputPriceAsc") {
      setSortBy("outputPriceDesc");
    } else {
      setSortBy("outputPriceAsc");
    }
  };

  if (error) {
    toast.error("加载AI列表失败,请稍后重试");
    return null;
  }

  return (
    <div className="agents-container">
      {/* 控制栏 */}
      <div className="agents-controls">
        <div className="search-wrapper">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            onSearch={() => setDebouncedSearchTerm(searchTerm)}
            onClear={() => {
              setSearchTerm("");
              setDebouncedSearchTerm("");
            }}
            placeholder="按名称搜索 AI 助手..."
          />
        </div>

        <div className="sort-buttons">
          <button
            className={`sort-button ${sortBy === "newest" ? "active" : ""}`}
            onClick={() => setSortBy("newest")}
          >
            发布时间
          </button>
          <button
            className={`sort-button ${
              sortBy?.includes("Price") ? "active" : ""
            }`}
            onClick={handlePriceSortClick}
          >
            价格
            {sortBy === "outputPriceAsc" && <ArrowUpIcon size={16} />}
            {sortBy === "outputPriceDesc" && <ArrowDownIcon size={16} />}
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="agents-content">
        {loading && !data.length && <LoadingState />}

        {data.length > 0 && (
          <div className="agents-grid">
            {data.map((item) => (
              <AgentBlock key={item.id} item={item} />
            ))}
          </div>
        )}

        {loading && data.length > 0 && (
          <div className="loading-more">
            <SyncIcon className="loading-more-icon" size={16} />
          </div>
        )}
      </div>

      <style href="public-agents-styles" precedence="default">{`
        .agents-container {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        /* 控制栏布局 */
        .agents-controls {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: var(--space-4);
          align-items: center;
          padding: var(--space-4) var(--space-4);
          background: var(--backgroundSecondary);
          border-radius: 12px;
          border: 1px solid var(--borderLight);
        }

        .search-wrapper {
          min-width: 0;
        }

        /* 排序按钮组 */
        .sort-buttons {
          display: flex;
          gap: var(--space-2);
          flex-shrink: 0;
        }

        .sort-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          height: 36px;
          border: 1px solid var(--border);
          background: var(--background);
          color: var(--textSecondary);
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 450;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .sort-button:hover {
          background: var(--backgroundHover);
          border-color: var(--borderHover);
          color: var(--text);
        }

        .sort-button.active {
          background: var(--primaryGhost);
          color: var(--primary);
          border-color: var(--primary);
          font-weight: 500;
        }

        .sort-button > svg {
          color: currentColor;
        }

        /* 内容区域 */
        .agents-content {
          min-height: 200px;
        }

        /* 网格布局 */
        .agents-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: var(--space-5);
        }

        /* 加载更多指示器 */
        .loading-more {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-8) var(--space-4);
          margin-top: var(--space-4);
          border-top: 1px solid var(--borderLight);
        }

        :global(.loading-more-icon) {
          animation: spin 1s linear infinite;
          color: var(--primary);
          opacity: 0.7;
        }

        /* 平板响应式 */
        @media (max-width: 900px) {
          .agents-controls {
            grid-template-columns: 1fr;
            gap: var(--space-3);
          }

          .sort-buttons {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .agents-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: var(--space-4);
          }
        }

        /* 手机响应式 */
        @media (max-width: 520px) {
          .agents-container {
            gap: var(--space-4);
          }

          .agents-controls {
            padding: var(--space-3);
            border-radius: 8px;
          }

          .agents-grid {
            grid-template-columns: 1fr;
            gap: var(--space-3);
          }

          .sort-button {
            padding: var(--space-2) var(--space-3);
            font-size: 0.875rem;
          }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
});

PublicAgents.displayName = "PublicAgents";

export default PublicAgents;
