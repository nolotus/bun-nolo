import { selectTheme } from "app/theme/themeSlice";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import { defaultTheme } from "../../styles/colors";

interface NavIconItemProps {
	path?: string;
	icon: React.ReactNode;
	onClick?: () => void;
}

const NavIconItem: React.FC<NavIconItemProps> = ({ path, icon, onClick }) => {
	const theme = useSelector(selectTheme);

	const baseStyles: React.CSSProperties = {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "42px",
		height: "42px",
		borderRadius: "12px",
		color: defaultTheme.textSecondary,
		textDecoration: "none",
		transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
		cursor: "pointer",
		marginBottom: "12px",
	};

	return (
		<>
			<style>
				{`
          .nav-icon-item:hover {
            background-color: ${defaultTheme.primaryGhost};
            color: ${defaultTheme.primary};
            transform: translateY(-1px);
            box-shadow: 0 4px 12px ${defaultTheme.primaryGhost};
          }
          
          .nav-icon-item.active {
            background-color: ${defaultTheme.primary}; 
            color: ${defaultTheme.background} !important;
            box-shadow: 0 4px 12px ${defaultTheme.primaryLight}33;
          }

          .nav-icon-item.active svg {
            fill: ${defaultTheme.background};
            color: ${defaultTheme.background};
          }
        `}
			</style>

			{onClick ? (
				<div onClick={onClick} className="nav-icon-item" style={baseStyles}>
					{icon}
				</div>
			) : path ? (
				<NavLink
					to={path}
					className={({ isActive }) =>
						`nav-icon-item ${isActive ? "active" : ""}`
					}
					style={baseStyles}
				>
					{icon}
				</NavLink>
			) : null}
		</>
	);
};

export default NavIconItem;
