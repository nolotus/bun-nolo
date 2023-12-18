import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

interface NavListItemProps {
	path: string;
	label: string;
	icon?: JSX.Element;
	className?: string;
}

const NavListItem: React.FC<NavListItemProps> = ({
	path,
	label,
	icon,
	className,
}) => {
	const mainColor = useSelector((state: any) => state.theme.mainColor);

	return (
		<li>
			<NavLink
				to={path}
				className={({ isActive }) =>
					isActive ? "active " + className : className
				}
				style={({ isActive }) => ({
					display: "block",
					padding: "8px 12px",
					fontWeight: "bold",
					transition: "color 0.2s, background-color 0.2s",
					color: isActive ? "white" : "#4a4a4a",
					backgroundColor: isActive ? mainColor : "transparent",
				})}
				onMouseEnter={(e) => {
					e.currentTarget.style.backgroundColor = mainColor;
					e.currentTarget.style.color = "white";
				}}
				onMouseLeave={(e) => {
					if (!e.currentTarget.classList.contains("active")) {
						e.currentTarget.style.backgroundColor = "transparent";
						e.currentTarget.style.color = "#4a4a4a";
					}
				}}
			>
				{icon && <span className="mr-2">{icon}</span>}
				{label}
			</NavLink>
		</li>
	);
};

export default NavListItem;
