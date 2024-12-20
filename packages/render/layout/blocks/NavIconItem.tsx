import type React from "react";
import { NavLink } from "react-router-dom";
import { defaultTheme } from "render/styles/colors";
import { ICON_SIZES, commonStyles } from "../MenuButton"; // 引入共享配置

interface NavIconItemProps {
	path?: string;
	icon: React.ReactNode;
	onClick?: () => void;
	iconSize?: number;
}

const NavIconItem: React.FC<NavIconItemProps> = ({
	path,
	icon,
	onClick,
	iconSize = ICON_SIZES.medium,
}) => {
	return (
		<>
			<style>
				{`
          .nav-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: ${commonStyles.buttonSize};
            height: ${commonStyles.buttonSize};
            padding: ${commonStyles.padding};
            border: ${commonStyles.border} solid transparent;
            border-radius: ${commonStyles.borderRadius};
            background: transparent;
            color: ${defaultTheme.textSecondary};
            cursor: pointer;
            transition: ${commonStyles.transition};
            position: relative;
            box-sizing: border-box;
            margin: 0;
            text-decoration: none;
          }

          .icon-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
          }

          .nav-icon:hover {
            color: ${defaultTheme.primary};
            background: ${defaultTheme.primaryGhost}15;
            border-color: ${defaultTheme.primary}20;
            transform: translateY(-1px);
          }
          
          .nav-icon svg {
            transition: ${commonStyles.transition};
          }

          .nav-icon:hover svg {
            transform: scale(${commonStyles.hoverScale});
          }

          .nav-icon.active {
            background: ${defaultTheme.primary};
            color: white;
            border-color: ${defaultTheme.primary};
          }

          .nav-icon.active::after {
            content: '';
            position: absolute;
            inset: -1px;
            border-radius: ${commonStyles.borderRadius};
            background: ${defaultTheme.primary}20;
            filter: blur(8px);
            z-index: -1;
          }

          @media (hover: none) {
            .nav-icon:hover {
              transform: none;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .nav-icon,
            .nav-icon svg {
              transition: none;
            }
          }
        `}
			</style>

			{onClick ? (
				<div className="nav-icon">
					<div className="icon-wrapper">{icon}</div>
				</div>
			) : path ? (
				<NavLink
					to={path}
					className={({ isActive }) => `nav-icon ${isActive ? "active" : ""}`}
				>
					<div className="icon-wrapper">{icon}</div>
				</NavLink>
			) : null}
		</>
	);
};

export default NavIconItem;
