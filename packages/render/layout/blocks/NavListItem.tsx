import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";

interface NavListItemProps {
	path: string;
	label: string;
	icon?: JSX.Element;
	style?: React.CSSProperties; // 添加style属性
}

const NavListItem: React.FC<NavListItemProps> = ({
	path,
	label,
	icon,
	style,
}) => {
	const mainColor = useSelector((state: any) => state.theme.mainColor); // 假设主题颜色来自redux

	// 默认样式，用于NavLink的基础样式
	const defaultStyle: React.CSSProperties = {
		display: "flex",
		alignItems: "center",
		padding: "8px 12px",
		fontWeight: "bold",
		transition: "color 0.2s, background-color 0.2s",
		color: "#444",
		...style, // 合并外部传入的style
	};

	return (
		<NavLink
			to={path}
			className={({ isActive }) => (isActive ? "active" : "")}
			style={({ isActive }) => ({
				...defaultStyle,
				color: isActive ? "white" : defaultStyle.color,
				backgroundColor: isActive ? mainColor : "transparent",
			})}
			onMouseEnter={(e) => {
				e.currentTarget.style.backgroundColor = mainColor;
				e.currentTarget.style.color = "white";
			}}
			onMouseLeave={(e) => {
				if (!e.currentTarget.classList.contains("active")) {
					e.currentTarget.style.backgroundColor = "transparent";
					e.currentTarget.style.color = "#444";
				}
			}}
		>
			{icon && <span style={{ marginRight: "8px" }}>{icon}</span>}
			<span>{label}</span>
		</NavLink>
	);
};

export default NavListItem;
