import { memo, useState, useEffect } from "react";
import {
  SyncIcon,
  SearchIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@primer/octicons-react";
import {
  usePublicAgents,
  UsePublicAgentsOptions,
} from "ai/agent/hooks/usePublicAgents";
import AgentBlock from "ai/agent/web/AgentBlock";
import toast from "react-hot-toast";

interface PublicAgentsProps {
  limit?: number;
  showEmpty?: boolean;
}

const LoadingState = memo(() => {
  return (
    <div className="loading-container">
      <SyncIcon className="loading-icon" size={24} />
      <span className="loading-text">发现更多AI助手中...</span>
      <style href="public-agents-loading" precedence="default">{`
        .loading-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-4);
          padding: var(--space-20) var(--space-6);
          color: var(--textSecondary);
          font-size: 1rem;
          font-weight: 400;
        }

        :global(.loading-icon) {
          color: var(--primary);
          animation: spin 1.2s linear infinite;
        }

        .loading-text {
          letter-spacing: 0.01em;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
});

LoadingState.displayName = "LoadingState";

const EmptyState = memo(() => {
  return (
    <div className="empty-state">
      <div className="empty-content">
        <div className="empty-icon">🤖</div>
        <div className="empty-title">暂无公开的AI助手</div>
        <div className="empty-description">
          稍后再来看看，或许会有新的AI助手加入
        </div>
      </div>
      <style href="public-agents-empty" precedence="default">{`
        .empty-state {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-24) var(--space-6);
          min-height: 300px;
        }

        .empty-content {
          text-align: center;
          max-width: 320px;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: var(--space-5);
          opacity: 0.6;
        }

        .empty-title {
          color: var(--textSecondary);
          font-size: 1.125rem;
          font-weight: 500;
          margin-bottom: var(--space-3);
          letter-spacing: -0.01em;
        }

        .empty-description {
          color: var(--textTertiary);
          font-size: 0.9rem;
          line-height: 1.6;
          font-weight: 400;
        }
      `}</style>
    </div>
  );
});

EmptyState.displayName = "EmptyState";

const PublicAgents = memo(
  ({ limit = 20, showEmpty = true }: PublicAgentsProps) => {
    const [sortBy, setSortBy] =
      useState<UsePublicAgentsOptions["sortBy"]>("newest");
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

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
      // 如果当前是升序，则切换到降序；否则（包括不是价格排序时），都切换到升序
      if (sortBy === "outputPriceAsc") {
        setSortBy("outputPriceDesc");
      } else {
        setSortBy("outputPriceAsc");
      }
    };

    if (error) {
      toast.error("加载AI列表失败，请稍后重试");
      return null;
    }

    return (
      <div className="agents-container">
        <div className="agents-controls">
          <div className="search-bar">
            <SearchIcon size={16} />
            <input
              type="text"
              placeholder="按名称搜索 AI 助手..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {/* 新的排序按钮组 */}
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

        {loading && !data.length && <LoadingState />}
        {!loading && !data.length && showEmpty && <EmptyState />}

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
            <span>加载更多中...</span>
          </div>
        )}

        <style href="public-agents-styles" precedence="default">{`
          .agents-container {
            width: 100%;
          }

          .agents-controls {
            display: flex;
            flex-wrap: wrap;
            gap: var(--space-4);
            margin-bottom: var(--space-6);
            padding: 0 var(--space-2);
          }

          .search-bar {
            flex-grow: 1;
            display: flex;
            align-items: center;
            gap: var(--space-3);
            background-color: var(--bg3);
            border: 1px solid var(--border);
            border-radius: var(--radius-md);
            padding: var(--space-2) var(--space-3);
            transition: border-color 0.2s, box-shadow 0.2s;
          }
          .search-bar:focus-within {
            border-color: var(--primary);
            box-shadow: 0 0 0 2px var(--primary-a3);
          }
          .search-bar > svg {
            color: var(--textTertiary);
          }
          .search-bar > input {
            width: 100%;
            border: none;
            background: transparent;
            outline: none;
            font-size: 0.9rem;
            color: var(--text);
          }
          .search-bar > input::placeholder {
            color: var(--textTertiary);
          }
          
          /* 排序按钮样式 */
          .sort-buttons {
            display: flex;
            gap: var(--space-2);
          }
          .sort-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: var(--space-2);
            padding: var(--space-2) var(--space-4);
            border: 1px solid var(--border);
            background-color: var(--bg3);
            color: var(--textSecondary);
            border-radius: var(--radius-md);
            font-size: 0.9rem;
            cursor: pointer;
            transition: background-color 0.2s, color 0.2s, border-color 0.2s;
          }
          .sort-button:hover {
            background-color: var(--bg-hover);
            border-color: var(--border-hover);
          }
          .sort-button.active {
            background-color: var(--primary-a3);
            color: var(--primary);
            border-color: var(--primary-a5);
          }
          .sort-button > svg {
            color: currentColor;
          }

          .agents-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: var(--space-6);
            padding: var(--space-2);
          }

          .loading-more {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--space-3);
            padding: var(--space-8);
            color: var(--textTertiary);
            font-size: 0.9rem;
            margin-top: var(--space-6);
            border-top: 1px solid var(--borderLight);
          }

          :global(.loading-more-icon) {
            animation: spin 1s linear infinite;
            color: var(--primary);
          }

          /* 响应式优化 */
          @media (max-width: 768px) {
            .agents-controls {
              flex-direction: column;
              align-items: stretch;
            }
            .agents-grid {
              grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
              gap: var(--space-4);
              padding: 0;
            }
          }

          @media (max-width: 520px) {
            .agents-grid {
              grid-template-columns: 1fr;
            }
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }
);

PublicAgents.displayName = "PublicAgents";

export default PublicAgents;
