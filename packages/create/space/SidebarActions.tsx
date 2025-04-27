import React, { useState, useRef, useEffect } from "react";
import { KebabHorizontalIcon, ChevronRightIcon } from "@primer/octicons-react";
import { createPortal } from "react-dom";
import DeleteContentButton from "./components/DeleteContentButton";
import { selectTheme } from "app/theme/themeSlice";
import { useSelector } from "react-redux";

interface SidebarActionsProps {
  contentKey: string;
  title: string;
  onMoveClick?: (contentKey: string) => void;
  onAddToConversation?: (contentKey: string) => void;
}

const MORE_ICON_SIZE = 16;

export const SidebarActions: React.FC<SidebarActionsProps> = React.memo(
  ({ contentKey, title, onMoveClick, onAddToConversation }) => {
    const theme = useSelector(selectTheme);
    const [menuOpen, setMenuOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // 切换下拉菜单的显示状态
    const handleToggleMenu = (e: React.MouseEvent) => {
      e.stopPropagation();
      setMenuOpen((prev) => !prev);
    };

    // 点击菜单项“移动到空间”时的回调
    const handleMoveClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onMoveClick) {
        onMoveClick(contentKey);
      }
      setMenuOpen(false);
    };

    // 点击“加入到当前对话”时的回调
    const handleAddToConversation = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onAddToConversation) {
        onAddToConversation(contentKey);
      }
    };

    // 监听外部点击，若点击区域不在当前组件内则关闭下拉菜单
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(e.target as Node)
        ) {
          setMenuOpen(false);
        }
      };

      if (menuOpen) {
        document.addEventListener("click", handleClickOutside);
      }

      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }, [menuOpen]);

    // 计算菜单位置
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    useEffect(() => {
      if (menuOpen && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMenuPosition({
          top: rect.bottom + window.scrollY + 4, // 按钮下方 4px
          left: rect.right + window.scrollX - 150, // 假设菜单宽度为 150px，右对齐
        });
      }
    }, [menuOpen]);

    // 菜单内容，使用 createPortal 渲染到 body
    const menuContent = menuOpen
      ? createPortal(
          <div
            className="SidebarItem__menu"
            role="menu"
            style={{
              position: "absolute",
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
            }}
          >
            <button
              className="SidebarItem__menuItem"
              onClick={handleMoveClick}
              role="menuitem"
            >
              移动到空间...
            </button>
            <DeleteContentButton
              contentKey={contentKey}
              title={title}
              theme={theme}
              className="SidebarItem__menuItem SidebarItem__deleteMenuItem"
            />
          </div>,
          document.body
        )
      : null;

    return (
      <>
        <div ref={containerRef} className="SidebarItem__actionButtons">
          <button
            className="SidebarItem__moreButton"
            onClick={handleToggleMenu}
            aria-haspopup="true"
            aria-expanded={menuOpen}
            title="更多操作"
          >
            <KebabHorizontalIcon size={MORE_ICON_SIZE} />
          </button>

          <button
            className="SidebarItem__addToConversationButton"
            onClick={handleAddToConversation}
            title="加入到当前对话"
          >
            <ChevronRightIcon size={MORE_ICON_SIZE} />
          </button>
        </div>

        {/* 渲染菜单内容 */}
        {menuContent}

        {/* 内联 CSS 样式 */}
        <style href="sidebar-actions" precedence="medium">{`
          .SidebarItem__actionButtons {
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            display: flex;
            align-items: center;
            gap: 5px;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s, background-color 0.2s, backdrop-filter 0.2s;
            z-index: 1;
            border-radius: 6px;
            padding: 3px 5px;
          }

          .SidebarItem:hover .SidebarItem__actionButtons {
            opacity: 1;
            pointer-events: auto;
            background-color: ${theme.backgroundTertiary}CC;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
          }

          .SidebarItem__moreButton,
          .SidebarItem__addToConversationButton {
            padding: 4px;
            border: none;
            background: none;
            cursor: pointer;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${theme.textTertiary};
            transition: background-color 0.15s, color 0.15s;
          }

          .SidebarItem__moreButton:hover,
          .SidebarItem__addToConversationButton:hover {
            background-color: ${theme.backgroundTertiaryHover || theme.backgroundTertiary};
            color: ${theme.textSecondary};
          }
          
          .SidebarItem__menu {
            background-color: ${theme.backgroundElevated || theme.background};
            border: 1px solid ${theme.border};
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            padding: 4px;
            z-index: 1000;
            min-width: 150px;
            animation: fadeIn 0.15s ease-out;
          }
          
          .SidebarItem__menuItem {
            display: block;
            width: 100%;
            text-align: left;
            padding: 8px 12px;
            font-size: 13px;
            line-height: 1.4;
            color: ${theme.text};
            background: none;
            border: none;
            cursor: pointer;
            border-radius: 4px;
            transition: background-color 0.15s;
            white-space: nowrap;
          }
          
          .SidebarItem__menuItem:hover {
            background-color: ${theme.backgroundHover};
          }
          
          .SidebarItem__deleteMenuItem {
            color: ${theme.danger || "#e53e3e"};
          }
          
          .SidebarItem__deleteMenuItem:hover {
            background-color: ${theme.backgroundHover};
            color: ${theme.danger || "#e53e3e"};
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </>
    );
  }
);

SidebarActions.displayName = "SidebarActions";
export default SidebarActions;
