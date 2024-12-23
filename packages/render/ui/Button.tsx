import { Spinner } from "@primer/react";
import { selectIsDarkMode, selectTheme } from "app/theme/themeSlice";
import OpenProps from "open-props";
// render/ui/Button.tsx
import type React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

export type ButtonProps = {
	className?: string;
	children?: React.ReactNode;
	onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
	width?: string;
	loading?: boolean;
	icon?: React.ReactNode;
	disabled?: boolean;
	type?: "button" | "submit" | "reset";
	style?: React.CSSProperties;
	hoverStyle?: React.CSSProperties;
};

export const Button: React.FC<ButtonProps> = ({
	className,
	children,
	onClick,
	width = "auto",
	loading = false,
	icon,
	disabled = false,
	type = "button",
	style,
	hoverStyle,
}) => {
	const [isHovered, setIsHovered] = useState(false);
	const theme = useSelector(selectTheme);
	const isDarkMode = useSelector(selectIsDarkMode);
	const { t } = useTranslation();

	const getHighlightColor = () =>
		isDarkMode
			? `hsl(${OpenProps.gray12Hsl}/25%)`
			: `hsl(${OpenProps.gray5Hsl}/25%)`;

	const baseStyles: React.CSSProperties = {
		alignItems: "center",
		background: isDarkMode ? theme.surface1 : "#fff",
		borderWidth: OpenProps.borderSize2,
		borderStyle: "solid",
		borderColor: theme.surface3,
		borderRadius: OpenProps.radius2,
		boxShadow: `${OpenProps.shadow2}, 0 1px ${theme.surface3}, 0 0 0 ${
			isHovered ? OpenProps.size2 : "0"
		} ${getHighlightColor()}`,
		color: theme.text2,
		display: "inline-flex",
		fontSize: theme.fontSize.medium,
		fontWeight: OpenProps.fontWeight7,
		gap: OpenProps.size2,
		justifyContent: "center",
		paddingBlock: ".75ch",
		paddingInline: OpenProps.sizeRelative6,
		textAlign: "center",
		textShadow: isDarkMode ? `0 1px 0 ${theme.surface1}` : `0 1px 0 "#dee2e6"`,
		transition: `all 0.2s ${OpenProps.ease3}`,
		userSelect: "none",
		WebkitTapHighlightColor: "transparent",
		WebkitTouchCallout: "none",
		cursor: disabled || loading ? "not-allowed" : "pointer",
		width,
	};

	const hoverStyles: React.CSSProperties = {
		borderColor: "currentColor",
		...hoverStyle,
	};

	const disabledStyles: React.CSSProperties = {
		background: "none",
		color: isDarkMode ? OpenProps.gray5 : OpenProps.gray6,
		boxShadow: OpenProps.shadow1,
		borderColor: disabled ? theme.surface3 : "", // 或者你想要的其他颜色
	};

	const combinedStyles = {
		...baseStyles,
		...(disabled || loading ? disabledStyles : {}),
		...(isHovered ? hoverStyles : {}),
		...style,
	};

	const handleMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
		if (!disabled && !loading) {
			onClick && onClick(event);
		}
	};

	const handleMouseEnter = () => {
		if (!disabled && !loading) {
			setIsHovered(true);
		}
	};

	const handleMouseLeave = () => {
		if (!disabled && !loading) {
			setIsHovered(false);
		}
	};

	return (
		<button
			className={className}
			style={combinedStyles}
			onMouseDown={handleMouseDown}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
			disabled={disabled || loading}
			type={type}
		>
			{loading && <Spinner size="small" />}
			{icon && !loading && icon}
			{children}
		</button>
	);
};

export default Button;
