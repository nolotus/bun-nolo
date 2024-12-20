// NavListItem.tsx
import { selectTheme } from "app/theme/themeSlice";
import type React from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { defaultTheme } from "../../styles/colors";

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
	const theme = useSelector(selectTheme);

	const baseStyles: React.CSSProperties = {
		display: "flex",
		alignItems: "center",
		padding: "8px 16px",
		marginBottom: "8px",
		color: defaultTheme.text,
		textDecoration: "none",
		transition: "all 0.2s ease",
		cursor: "pointer",
		fontWeight: 600,
	};

	const Content = () => {
		if (!icon && !label) return null;

		return (
			<>
				{icon && <span className="nav-icon">{icon}</span>}
				{label && <span className="nav-label">{label}</span>}
			</>
		);
	};

	return (
		<>
			<style>
				{`
          .nav-icon {
            margin-right: 16px;
          }
          
          .nav-item:hover {
            background-color: ${defaultTheme.backgroundSecondary};
            color: ${defaultTheme.primary};
          }
          
          .nav-item:hover .nav-icon,
          .nav-item:hover .nav-label {
            color: ${defaultTheme.primary};
          }
          
          .nav-item.active {
            background-color: ${defaultTheme.primary};
            color: ${defaultTheme.background};
          }
          
          .nav-item.active .nav-icon,
          .nav-item.active .nav-label {
            color: ${defaultTheme.background};
          }
        `}
			</style>

			{onClick ? (
				<div onClick={onClick} className="nav-item" style={baseStyles}>
					<Content />
				</div>
			) : path ? (
				<NavLink
					to={path}
					className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
					style={baseStyles}
				>
					<Content />
				</NavLink>
			) : null}
		</>
	);
};

export default NavListItem;
