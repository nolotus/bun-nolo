import type React from "react";
import { NavLink } from "react-router-dom";
import { defaultTheme } from "../../styles/colors";
import { commonStyles } from "../MenuButton"; // 引入共享样式

interface NavListItemProps {
	path?: string;
	label?: string;
	icon?: React.ReactNode;
	onClick?: () => void;
}

const NavListItem: React.FC<NavListItemProps> = ({
	path,
	label,
	icon,
	onClick,
}) => {
	return (
		<>
			<style>
				{`
          .nav-list-item {
            display: flex;
            align-items: center;
            padding: 8px 16px;
            border-radius: ${commonStyles.borderRadius};
            color: ${defaultTheme.text};
            background: transparent;
            border: ${commonStyles.border} solid transparent;
            text-decoration: none;
            transition: ${commonStyles.transition};
            cursor: pointer;
            font-weight: 500;
            height: ${commonStyles.buttonSize};
            box-sizing: border-box;
            margin: 0;
          }

          .nav-list-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 12px;
            color: ${defaultTheme.textSecondary};
            transition: ${commonStyles.transition};
          }
          
          .nav-list-label {
            font-size: 14px;
            transition: ${commonStyles.transition};
          }

          .nav-list-item:hover {
            color: ${defaultTheme.primary};
            background: ${defaultTheme.primaryGhost}15;
            border-color: ${defaultTheme.primary}20;
            transform: translateY(-1px);
          }
          
          .nav-list-item:hover .nav-list-icon {
            color: ${defaultTheme.primary};
          }

          .nav-list-item.active {
            background: ${defaultTheme.primary};
            color: ${defaultTheme.background};
            border-color: ${defaultTheme.primary};
          }
          
          .nav-list-item.active .nav-list-icon {
            color: ${defaultTheme.background};
          }

          @media (hover: none) {
            .nav-list-item:hover {
              transform: none;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .nav-list-item,
            .nav-list-icon,
            .nav-list-label {
              transition: none;
            }
          }
        `}
			</style>

			{onClick ? (
				<div onClick={onClick} className="nav-list-item">
					{icon && <span className="nav-list-icon">{icon}</span>}
					{label && <span className="nav-list-label">{label}</span>}
				</div>
			) : path ? (
				<NavLink
					to={path}
					className={({ isActive }) =>
						`nav-list-item ${isActive ? "active" : ""}`
					}
				>
					{icon && <span className="nav-list-icon">{icon}</span>}
					{label && <span className="nav-list-label">{label}</span>}
				</NavLink>
			) : null}
		</>
	);
};

export default NavListItem;
