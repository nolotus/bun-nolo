// SidebarActions.tsx
import React, { useState, useRef, useEffect } from "react";
import { KebabHorizontalIcon } from "@primer/octicons-react";
import DeleteContentButton from "./components/DeleteContentButton";

interface SidebarActionsProps {
  contentKey: string;
  displayTitle: string;
  theme: any;
  onMove: (e: React.MouseEvent) => void;
}

const MORE_ICON_SIZE = 16;

const SidebarActions: React.FC<SidebarActionsProps> = ({
  contentKey,
  displayTitle,
  theme,
  onMove,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 切换下拉菜单的显示状态
  const handleToggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  };

  // 点击菜单项时执行回调并关闭菜单
  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMove(e);
    setMenuOpen(false);
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

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
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

      <DeleteContentButton
        contentKey={contentKey}
        title={displayTitle}
        theme={theme}
        className="SidebarItem__deleteButton"
      />

      {menuOpen && (
        <div className="SidebarItem__menu" role="menu">
          <button
            className="SidebarItem__menuItem"
            onClick={handleMenuClick}
            role="menuitem"
          >
            移动到空间...
          </button>
        </div>
      )}
    </div>
  );
};

export default SidebarActions;
