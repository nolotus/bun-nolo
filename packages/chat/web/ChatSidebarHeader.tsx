// 路径: <你的组件目录>/ChatSidebarHeader.tsx

import React from "react";
import {
  FoldDownIcon,
  FoldUpIcon,
  NoteIcon,
  FileDirectoryIcon,
  ChecklistIcon,
  TrashIcon,
  XIcon,
} from "@primer/octicons-react";

interface ChatSidebarHeaderProps {
  isSelectionMode: boolean;
  selectedItemsCount: number;
  areAllItemsSelected: boolean;
  areAllCollapsed: boolean;
  allVisibleCategoryIdsCount: number;
  onSelectAll: () => void;
  onDeleteSelected: () => void;
  onToggleSelectionMode: () => void;
  onNewPage: () => void;
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
  onNewPage,
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
                <ChecklistIcon size={14} />
              </button>
              <button
                className="SidebarHeader__icon-btn SidebarHeader__icon-btn--danger"
                onClick={onDeleteSelected}
                title="删除所选"
                disabled={selectedItemsCount === 0}
                type="button"
              >
                <TrashIcon size={14} />
              </button>
              <div className="SidebarHeader__divider"></div>
              <button
                className="SidebarHeader__icon-btn"
                onClick={onToggleSelectionMode}
                title="取消选择模式"
                type="button"
              >
                <XIcon size={16} />
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="SidebarHeader__title">内容</h3>
            <div className="SidebarHeader__actions">
              <button
                className="SidebarHeader__icon-btn"
                onClick={onNewPage}
                title="新建页面"
                type="button"
              >
                <NoteIcon size={14} />
              </button>
              <button
                className="SidebarHeader__icon-btn"
                onClick={onAddCategory}
                title="新建分类"
                type="button"
              >
                <FileDirectoryIcon size={14} />
              </button>
              <button
                className="SidebarHeader__icon-btn"
                onClick={onToggleSelectionMode}
                title="批量选择"
                type="button"
              >
                <ChecklistIcon size={14} />
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
                  <FoldUpIcon size={14} />
                ) : (
                  <FoldDownIcon size={14} />
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

        .SidebarHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-2);
          flex-shrink: 0;
          box-sizing: border-box;
          height: var(--headerHeight);
          /* As requested, top and bottom borders are removed */
          background: var(--background);
        }

        .SidebarHeader__title {
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--textTertiary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
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
          width: 28px;
          height: 28px;
          padding: 0;
          background: none;
          border: none;
          color: var(--textTertiary);
          cursor: pointer;
          border-radius: var(--space-1);
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

        .SidebarHeader__icon-btn:hover:not(:disabled)::before {
          opacity: 1;
        }

        .SidebarHeader__icon-btn:hover:not(:disabled) {
          color: var(--textSecondary);
          transform: translateY(-1px);
        }

        .SidebarHeader__icon-btn:active {
          transform: translateY(0);
          animation: buttonPulse 0.2s ease;
        }

        .SidebarHeader__icon-btn--danger::before {
          background: var(--error);
          opacity: 0;
        }

        .SidebarHeader__icon-btn--danger:hover:not(:disabled) {
          color: var(--error);
        }

        .SidebarHeader__icon-btn--danger:hover:not(:disabled)::before {
          opacity: 0.12;
        }

        .SidebarHeader__icon-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .SidebarHeader__icon-btn:disabled:hover {
          transform: none;
        }

        .SidebarHeader__divider {
          width: 1px;
          height: 14px;
          background-color: var(--border);
          margin: 0 var(--space-1);
          flex-shrink: 0;
        }
        
        /* 图标在按钮中的样式 */
        .SidebarHeader__icon-btn svg {
          position: relative;
          z-index: 1;
          flex-shrink: 0;
        }
      `}</style>
    </>
  );
};

export default ChatSidebarHeader;
