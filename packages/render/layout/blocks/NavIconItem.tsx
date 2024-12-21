import type React from "react";
import { NavLink } from "react-router-dom";
import { defaultTheme } from "render/styles/colors";

interface NavIconItemProps {
	path?: string;
	icon: React.ReactNode;
	onClick?: () => void;
}

const styles = {
	size: "32px",
	borderRadius: "6px",
	transition: "all 0.2s ease",
};

const NavIconItem: React.FC<NavIconItemProps> = ({ path, icon, onClick }) => {
	return (
		<>
			<style>
				{`
          .nav-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: ${styles.size};
            height: ${styles.size};
            padding: 0;
            border-radius: ${styles.borderRadius};
            background: transparent;
            color: ${defaultTheme.textSecondary};
            cursor: pointer;
            transition: ${styles.transition};
            text-decoration: none;
          }

          .nav-icon:hover {
            color: ${defaultTheme.primary};
            background: ${defaultTheme.primaryGhost};
          }

          .nav-icon.active {
            background: ${defaultTheme.primary};
            color: white;
          }

          @media (prefers-reduced-motion: reduce) {
            .nav-icon {
              transition: none;
            }
          }
        `}
			</style>

			{onClick ? (
				<div className="nav-icon" onClick={onClick}>
					{icon}
				</div>
			) : path ? (
				<NavLink
					to={path}
					className={({ isActive }) => `nav-icon ${isActive ? "active" : ""}`}
				>
					{icon}
				</NavLink>
			) : null}
		</>
	);
};

export default NavIconItem;
