// render/form/Input.tsx
import type React from "react";
import { forwardRef } from "react";
import { defaultTheme } from "render/styles/colors";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	variant?: "default" | "password" | "search";
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
	({ variant = "default", style, ...props }, ref) => {
		const baseStyle = {
			width: "100%",
			padding: "8px",
			border: `1px solid ${defaultTheme.border}`,
			borderRadius: "4px",
			backgroundColor: defaultTheme.backgroundSecondary,
			color: defaultTheme.text,
			outline: "none",
			transition: "border-color 0.3s ease",
			"&:focus": {
				borderColor: defaultTheme.primary,
			},
		};

		const variantStyles = {
			default: {},
			password: {
				// 可以添加密码输入框特定的样式
			},
			search: {
				// 可以添加搜索输入框特定的样式
				paddingLeft: "30px", // 为搜索图标留空间
			},
		};

		const combinedStyle = {
			...baseStyle,
			...variantStyles[variant],
			...style,
		};

		return <input ref={ref} style={combinedStyle} {...props} />;
	},
);

Input.displayName = "Input";

// 可选的：添加图标支持
export const SearchInput = forwardRef<HTMLInputElement, InputProps>(
	(props, ref) => {
		return (
			<div style={{ position: "relative" }}>
				<Input variant="search" {...props} ref={ref} />
				{/* 可以在这里添加搜索图标 */}
			</div>
		);
	},
);

SearchInput.displayName = "SearchInput";
