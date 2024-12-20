import { MoveToEndIcon, MoveToStartIcon } from "@primer/octicons-react";
import type React from "react";
import { defaultTheme } from "render/styles/colors";

// 共享常量直接定义在组件文件中
export const ICON_SIZES = {
	small: 18,
	medium: 20,
	large: 22,
};

export const commonStyles = {
	buttonSize: "36px",
	borderRadius: "8px",
	transition: "all 0.2s ease",
	hoverScale: "1.05",
	padding: "0",
	border: "1px",
	spacing: "8px",
	// 确保图标在容器中居中
	iconWrapper: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
		height: "100%",
	},
};

interface MenuButtonProps {
	onClick: () => void;
	isExpanded: boolean;
	iconSize?: number;
}

const MenuButton: React.FC<MenuButtonProps> = ({
	onClick,
	isExpanded,
	iconSize = ICON_SIZES.medium,
}) => {
	return (
		<>
			<style>
				{`
          .menu-toggle {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: ${commonStyles.buttonSize};
            height: ${commonStyles.buttonSize};
            padding: ${commonStyles.padding};
            border: ${commonStyles.border} solid ${defaultTheme.border};
            border-radius: ${commonStyles.borderRadius};
            background: transparent;
            color: ${defaultTheme.textSecondary};
            cursor: pointer;
            transition: ${commonStyles.transition};
            position: relative;
            box-sizing: border-box;
            margin: 0;
          }

          .menu-toggle:hover {
            color: ${defaultTheme.primary};
            border-color: ${defaultTheme.primary}20;
            background: ${defaultTheme.primaryGhost}15;
            transform: translateY(-1px);
          }

          .menu-toggle:active {
            transform: translateY(0);
          }

          .menu-toggle svg {
            transition: ${commonStyles.transition};
          }

          .menu-toggle:hover svg {
            transform: scale(${commonStyles.hoverScale});
          }

          .icon-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
          }

          @media (hover: none) {
            .menu-toggle:hover {
              transform: none;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .menu-toggle,
            .menu-toggle svg {
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
				<div className="icon-wrapper">
					{isExpanded ? (
						<MoveToStartIcon size={iconSize} />
					) : (
						<MoveToEndIcon size={iconSize} />
					)}
				</div>
			</button>
		</>
	);
};

export default MenuButton;
