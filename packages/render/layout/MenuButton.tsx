import { MdMenuOpen, MdMenu } from "react-icons/md";
import { useTheme } from "app/theme";
import type React from "react";

interface MenuButtonProps {
  onClick: () => void;
  isExpanded: boolean;
  iconSize?: number;
}

const MenuButton: React.FC<MenuButtonProps> = ({
  onClick,
  isExpanded,
  iconSize = 16,
}) => {
  const theme = useTheme();
  return (
    <>
      <style>
        {`
          .menu-toggle {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            padding: 0;
            border: 1px solid ${theme.border};
            border-radius: 6px;
            background: transparent;
            color: ${theme.textSecondary};
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
          }

          .menu-toggle:hover {
            color: ${theme.primary};
            border-color: ${theme.primary};
            background: ${theme.primaryGhost};
          }

          .menu-toggle:active {
            transform: translateY(1px);
          }

          @media (prefers-reduced-motion: reduce) {
            .menu-toggle {
              transition: none;
            }
          }
        `}
      </style>

      <button
        className="menu-toggle"
        onClick={onClick}
        aria-label={isExpanded ? "收起菜单" : "展开菜单"}
        title={isExpanded ? "收起菜单" : "展开菜单"}
      >
        {isExpanded ? (
          <MdMenuOpen size={iconSize} />
        ) : (
          <MdMenu size={iconSize} />
        )}
      </button>
    </>
  );
};

export default MenuButton;
