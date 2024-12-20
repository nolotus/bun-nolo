import { MoveToEndIcon, MoveToStartIcon } from "@primer/octicons-react";
import type React from "react";
import { defaultTheme } from "render/styles/colors";

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
            border: 1px solid ${defaultTheme.border};
            border-radius: 6px;
            background: transparent;
            color: ${defaultTheme.textSecondary};
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
          }

          .menu-toggle:hover {
            color: ${defaultTheme.primary};
            border-color: ${defaultTheme.primary};
            background: ${defaultTheme.primaryGhost};
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
					<MoveToStartIcon size={iconSize} />
				) : (
					<MoveToEndIcon size={iconSize} />
				)}
			</button>
		</>
	);
};

export default MenuButton;
