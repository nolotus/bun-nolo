import React from "react";
import {
  LuChevronDown,
  LuChevronUp,
  LuFolderPlus,
  LuCheck,
  LuTrash2,
  LuX,
} from "react-icons/lu";

interface ChatSidebarHeaderProps {
  isSelectionMode: boolean;
  selectedItemsCount: number;
  areAllItemsSelected: boolean;
  areAllCollapsed: boolean;
  allVisibleCategoryIdsCount: number;
  onSelectAll: () => void;
  onDeleteSelected: () => void;
  onToggleSelectionMode: () => void;
  onAddCategory: () => void;
  onToggleAllCategories: () => void;
}

const ChatSidebarHeader: React.FC<ChatSidebarHeaderProps> = ({
  isSelectionMode,
  selectedItemsCount,
  areAllItemsSelected,
  areAllCollapsed,
  allVisibleCategoryIdsCount,
  onSelectAll,
  onDeleteSelected,
  onToggleSelectionMode,
  onAddCategory,
  onToggleAllCategories,
}) => {
  return (
    <>
      <div className="SidebarHeader">
        {isSelectionMode ? (
          <>
            <h3 className="SidebarHeader__title">
              {selectedItemsCount} 项已选择
            </h3>
            <div className="SidebarHeader__actions">
              <button
                className="SidebarHeader__icon-btn"
                onClick={onSelectAll}
                title={areAllItemsSelected ? "取消全选" : "全部选择"}
                type="button"
              >
                <LuCheck size={14} />
              </button>
              <button
                className="SidebarHeader__icon-btn SidebarHeader__icon-btn--danger"
                onClick={onDeleteSelected}
                title="删除所选"
                disabled={selectedItemsCount === 0}
                type="button"
              >
                <LuTrash2 size={14} />
              </button>
              <div className="SidebarHeader__divider"></div>
              <button
                className="SidebarHeader__icon-btn"
                onClick={onToggleSelectionMode}
                title="取消选择模式"
                type="button"
              >
                <LuX size={16} />
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="SidebarHeader__title">内容</h3>
            <div className="SidebarHeader__actions">
              <button
                className="SidebarHeader__icon-btn"
                onClick={onAddCategory}
                title="新建分类"
                type="button"
              >
                <LuFolderPlus size={14} />
              </button>
              <button
                className="SidebarHeader__icon-btn"
                onClick={onToggleSelectionMode}
                title="批量选择"
                type="button"
              >
                <LuCheck size={14} />
              </button>
              <div className="SidebarHeader__divider"></div>
              <button
                className="SidebarHeader__icon-btn"
                onClick={onToggleAllCategories}
                title={areAllCollapsed ? "全部展开" : "全部折叠"}
                disabled={allVisibleCategoryIdsCount === 0}
                type="button"
              >
                {areAllCollapsed ? (
                  <LuChevronUp size={14} />
                ) : (
                  <LuChevronDown size={14} />
                )}
              </button>
            </div>
          </>
        )}
      </div>
      <style href="ChatSidebarHeader-styles" precedence="component">{`
        @keyframes buttonPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes titleSlide {
          0% {
            opacity: 0;
            transform: translateX(-8px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .SidebarHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 var(--space-3);
          flex-shrink: 0;
          box-sizing: border-box;
          height: var(--headerHeight);
          background: var(--background);
          position: relative;
          z-index: 1;
        }

        .SidebarHeader::after {
          content: '';
          position: absolute;
          left: var(--space-3);
          right: var(--space-3);
          bottom: 0;
          height: 1px;
          background: var(--borderLight);
          opacity: 0.6;
        }

        .SidebarHeader__title {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--textTertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          animation: titleSlide 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }

        .SidebarHeader__actions {
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }

        .SidebarHeader__icon-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          padding: 0;
          background: none;
          border: none;
          color: var(--textTertiary);
          cursor: pointer;
          border-radius: var(--space-2);
          transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
          position: relative;
          overflow: hidden;
          font-family: inherit;
        }

        .SidebarHeader__icon-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--backgroundHover);
          opacity: 0;
          transition: opacity 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);
          border-radius: inherit;
        }

        .SidebarHeader__icon-btn:hover:not(:disabled) {
          color: var(--textSecondary);
          transform: translateY(-1px);
          box-shadow: 0 2px 8px var(--shadow1);
        }

        .SidebarHeader__icon-btn:hover:not(:disabled)::before {
          opacity: 1;
        }

        .SidebarHeader__icon-btn:active {
          transform: translateY(0);
          animation: buttonPulse 0.2s ease;
          box-shadow: 0 1px 3px var(--shadow1);
        }

        .SidebarHeader__icon-btn--danger {
          position: relative;
        }

        .SidebarHeader__icon-btn--danger::before {
          background: var(--error);
          opacity: 0;
        }

        .SidebarHeader__icon-btn--danger:hover:not(:disabled) {
          color: var(--error);
          transform: translateY(-1px);
        }

        .SidebarHeader__icon-btn--danger:hover:not(:disabled)::before {
          opacity: 0.1;
        }

        .SidebarHeader__icon-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          transform: none !important;
        }

        .SidebarHeader__icon-btn:disabled:hover {
          transform: none;
          box-shadow: none;
        }

        .SidebarHeader__divider {
          width: 1px;
          height: 16px;
          background: linear-gradient(to bottom, 
            transparent, 
            var(--border) 20%, 
            var(--border) 80%, 
            transparent
          );
          margin: 0 var(--space-2);
          flex-shrink: 0;
          opacity: 0.7;
        }
        
        .SidebarHeader__icon-btn svg {
          position: relative;
          z-index: 1;
          flex-shrink: 0;
          transition: transform 0.15s ease;
        }

        .SidebarHeader__icon-btn:hover:not(:disabled) svg {
          transform: scale(1.05);
        }

        /* 响应式优化 */
        @media (max-width: 768px) {
          .SidebarHeader {
            padding: 0 var(--space-2);
          }
          
          .SidebarHeader::after {
            left: var(--space-2);
            right: var(--space-2);
          }
          
          .SidebarHeader__icon-btn {
            width: 28px;
            height: 28px;
          }
          
          .SidebarHeader__actions {
            gap: 2px;
          }
          
          .SidebarHeader__divider {
            margin: 0 var(--space-1);
          }
        }

        /* 减动画偏好设置 */
        @media (prefers-reduced-motion: reduce) {
          .SidebarHeader__title {
            animation: none;
          }
          
          .SidebarHeader__icon-btn {
            transition-duration: 0.1s;
          }
          
          @keyframes buttonPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
          }
        }
      `}</style>
    </>
  );
};

export default ChatSidebarHeader;
