import type React from "react";
import { NavLink } from "react-router-dom";
import { defaultTheme } from "../../styles/colors";

interface NavListItemProps {
	path?: string;
	label?: string;
	icon?: React.ReactNode;
	onClick?: () => void;
	size?: "default" | "large";
}

const styles = {
	borderRadius: "6px",
	transition: "all 0.2s ease",
};

const NavListItem: React.FC<NavListItemProps> = ({
	path,
	label,
	icon,
	onClick,
	size = "default",
}) => {
	const height = size === "large" ? "48px" : "32px";
	const padding = size === "large" ? "0 16px" : "0 12px";
	const fontSize = size === "large" ? "16px" : "14px";
	const iconMargin = size === "large" ? "12px" : "8px";

	return (
		<>
			<style>
				{`
          .nav-list-item {
            display: flex;
            align-items: center;
            padding: ${padding};
            border-radius: ${styles.borderRadius};
            color: ${defaultTheme.text};
            background: transparent;
            text-decoration: none;
            transition: ${styles.transition};
            cursor: pointer;
            font-weight: 400;
            height: ${height};
            font-size: ${fontSize};
          }

          .nav-list-icon {
            display: flex;
            align-items: center;
            margin-right: ${iconMargin};
            color: ${defaultTheme.textSecondary};
          }

          .nav-list-item:hover {
            color: ${defaultTheme.primary};
            background: ${defaultTheme.primaryGhost};
          }
          
          .nav-list-item:hover .nav-list-icon {
            color: ${defaultTheme.primary};
          }

          .nav-list-item.active {
            background: ${defaultTheme.primary};
            color: ${defaultTheme.background};
          }
          
          .nav-list-item.active .nav-list-icon {
            color: ${defaultTheme.background};
          }

          @media (prefers-reduced-motion: reduce) {
            .nav-list-item {
              transition: none;
            }
          }
        `}
			</style>

			{onClick ? (
				<div onClick={onClick} className="nav-list-item">
					{icon && <span className="nav-list-icon">{icon}</span>}
					{label}
				</div>
			) : path ? (
				<NavLink
					to={path}
					className={({ isActive }) =>
						`nav-list-item ${isActive ? "active" : ""}`
					}
				>
					{icon && <span className="nav-list-icon">{icon}</span>}
					{label}
				</NavLink>
			) : null}
		</>
	);
};

export default NavListItem;
