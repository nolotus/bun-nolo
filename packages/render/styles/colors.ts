// render/styles/colors.ts

const BASE_COLORS = {
	light: {
		// 主色调相关
		primary: "#0062ff",
		primaryLight: "#33ccff",
		primaryGhost: "rgba(0, 98, 255, 0.1)",
		primaryGradient: "linear-gradient(45deg, #0062ff, #33ccff)",

		// 背景色相关
		background: "#FFFFFF",
		backgroundSecondary: "#F9FAFB",
		backgroundGhost: "rgba(255, 255, 255, 0.9)",

		// 文本色相关
		text: "#111827",
		textSecondary: "#4B5563",
		textTertiary: "#666666",
		textLight: "#888888",
		placeholder: "#9CA3AF",

		// 边框相关
		border: "#E5E7EB",
		borderHover: "#D1D5DB",
		borderLight: "rgba(255, 255, 255, 0.3)",

		// 状态相关
		error: "#ef4444",

		// 阴影相关
		shadowLight: "rgba(0,0,0,0.06)",
		shadowMedium: "rgba(0,0,0,0.08)",
		shadowHeavy: "rgba(0,0,0,0.1)",

		// 特殊用途
		dropZoneActive: "rgba(0, 98, 255, 0.08)",
	},
	dark: {
		// 主色调相关
		primary: "#33ccff",
		primaryLight: "#0062ff",
		primaryGhost: "rgba(51, 204, 255, 0.1)",
		primaryGradient: "linear-gradient(45deg, #33ccff, #0062ff)",

		// 背景色相关
		background: "#1A1A1A",
		backgroundSecondary: "#262626",
		backgroundGhost: "rgba(26, 26, 26, 0.9)",

		// 文本色相关
		text: "#FFFFFF",
		textSecondary: "#A3A3A3",
		textTertiary: "#8C8C8C",
		textLight: "#666666",
		placeholder: "#595959",

		// 边框相关
		border: "#333333",
		borderHover: "#404040",
		borderLight: "rgba(26, 26, 26, 0.3)",

		// 图标
		icon: "#A3A3A3",

		// 状态相关
		error: "#ff4d4f",

		// 阴影相关
		shadowLight: "rgba(0,0,0,0.15)",
		shadowMedium: "rgba(0,0,0,0.2)",
		shadowHeavy: "rgba(0,0,0,0.25)",

		// 特殊用途
		dropZoneActive: "rgba(51, 204, 255, 0.08)",
	},
};

// 头像等地方用的渐变色
export const GRADIENTS = {
	light: {
		gray: "linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%)",
		blue: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
		purple: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
		white: "linear-gradient(135deg, #dfe9f3 0%, white 100%)",
	},
	dark: {
		gray: "linear-gradient(135deg, #2d3436 0%, #2d3436 100%)",
		blue: "linear-gradient(135deg, #2d3436 0%, #2d3436 100%)",
		purple: "linear-gradient(135deg, #2d3436 0%, #2d3436 100%)",
		white: "linear-gradient(135deg, #2d3436 0%, #2d3436 100%)",
	},
};

export const themes = {
	blue: {
		light: {
			primary: "#2563eb",
			primaryLight: "#6ea8ff",
			primaryBg: "#f0f7ff",
			hover: "#1e56d3",
			focus: "rgba(37, 99, 235, 0.12)",
			primaryGhost: "rgba(0, 98, 255, 0.1)",
			primaryGradient: "linear-gradient(45deg, #0062ff, #33ccff)",
			name: "默认蓝",
		},
		dark: {
			primary: "#6ea8ff",
			primaryLight: "#2563eb",
			primaryBg: "#1a1f2b",
			hover: "#85b5ff",
			focus: "rgba(110, 168, 255, 0.12)",
			primaryGhost: "rgba(110, 168, 255, 0.1)",
			primaryGradient: "linear-gradient(45deg, #6ea8ff, #85b5ff)",
			name: "默认蓝(暗色)",
		},
	},
	green: {
		light: {
			primary: "#059669",
			primaryLight: "#47c199",
			primaryBg: "#f0fdf9",
			hover: "#048a5f",
			focus: "rgba(5, 150, 105, 0.12)",
			primaryGhost: "rgba(5, 150, 105, 0.1)",
			primaryGradient: "linear-gradient(45deg, #059669, #47c199)",
			name: "清新绿",
		},
		dark: {
			primary: "#47c199",
			primaryLight: "#059669",
			primaryBg: "#1a2622",
			hover: "#5ad1aa",
			focus: "rgba(71, 193, 153, 0.12)",
			primaryGhost: "rgba(71, 193, 153, 0.1)",
			primaryGradient: "linear-gradient(45deg, #47c199, #5ad1aa)",
			name: "清新绿(暗色)",
		},
	},
	purple: {
		light: {
			primary: "#7c3aed",
			primaryLight: "#a586ff",
			primaryBg: "#f6f4ff",
			hover: "#6a31d1",
			focus: "rgba(124, 58, 237, 0.12)",
			primaryGhost: "rgba(124, 58, 237, 0.1)",
			primaryGradient: "linear-gradient(45deg, #7c3aed, #a586ff)",
			name: "典雅紫",
		},
		dark: {
			primary: "#a586ff",
			primaryLight: "#7c3aed",
			primaryBg: "#1f1a2e",
			hover: "#b799ff",
			focus: "rgba(165, 134, 255, 0.12)",
			primaryGhost: "rgba(165, 134, 255, 0.1)",
			primaryGradient: "linear-gradient(45deg, #a586ff, #b799ff)",
			name: "典雅紫(暗色)",
		},
	},
	pink: {
		light: {
			primary: "#db2777",
			primaryLight: "#f17eae",
			primaryBg: "#fef1f7",
			hover: "#c32069",
			focus: "rgba(219, 39, 119, 0.12)",
			primaryGhost: "rgba(219, 39, 119, 0.1)",
			primaryGradient: "linear-gradient(45deg, #db2777, #f17eae)",
			name: "温柔粉",
		},
		dark: {
			primary: "#f17eae",
			primaryLight: "#db2777",
			primaryBg: "#2a1922",
			hover: "#f591bb",
			focus: "rgba(241, 126, 174, 0.12)",
			primaryGhost: "rgba(241, 126, 174, 0.1)",
			primaryGradient: "linear-gradient(45deg, #f17eae, #f591bb)",
			name: "温柔粉(暗色)",
		},
	},
	yellow: {
		light: {
			primary: "#d97706",
			primaryLight: "#faa53d",
			primaryBg: "#fff9eb",
			hover: "#c16a05",
			focus: "rgba(217, 119, 6, 0.12)",
			primaryGhost: "rgba(217, 119, 6, 0.1)",
			primaryGradient: "linear-gradient(45deg, #d97706, #faa53d)",
			name: "明亮黄",
		},
		dark: {
			primary: "#faa53d",
			primaryLight: "#d97706",
			primaryBg: "#2a241a",
			hover: "#fbb254",
			focus: "rgba(250, 165, 61, 0.12)",
			primaryGhost: "rgba(250, 165, 61, 0.1)",
			primaryGradient: "linear-gradient(45deg, #faa53d, #fbb254)",
			name: "明亮黄(暗色)",
		},
	},
	red: {
		light: {
			primary: "#dc2626",
			primaryLight: "#f47171",
			primaryBg: "#fff1f1",
			hover: "#c72020",
			focus: "rgba(220, 38, 38, 0.12)",
			primaryGhost: "rgba(220, 38, 38, 0.1)",
			primaryGradient: "linear-gradient(45deg, #dc2626, #f47171)",
			name: "热情红",
		},
		dark: {
			primary: "#f47171",
			primaryLight: "#dc2626",
			primaryBg: "#2a1a1a",
			hover: "#f58585",
			focus: "rgba(244, 113, 113, 0.12)",
			primaryGhost: "rgba(244, 113, 113, 0.1)",
			primaryGradient: "linear-gradient(45deg, #f47171, #f58585)",
			name: "热情红(暗色)",
		},
	},
	orange: {
		light: {
			primary: "#ea580c",
			primaryLight: "#ff8f4d",
			primaryBg: "#fff4ed",
			hover: "#d14e0a",
			focus: "rgba(234, 88, 12, 0.12)",
			primaryGhost: "rgba(234, 88, 12, 0.1)",
			primaryGradient: "linear-gradient(45deg, #ea580c, #ff8f4d)",
			name: "活力橙",
		},
		dark: {
			primary: "#ff8f4d",
			primaryLight: "#ea580c",
			primaryBg: "#2a1f1a",
			hover: "#ffa066",
			focus: "rgba(255, 143, 77, 0.12)",
			primaryGhost: "rgba(255, 143, 77, 0.1)",
			primaryGradient: "linear-gradient(45deg, #ff8f4d, #ffa066)",
			name: "活力橙(暗色)",
		},
	},
	graphite: {
		light: {
			primary: "#4b5563",
			primaryLight: "#8b95a5",
			primaryBg: "#f8fafb",
			hover: "#404a57",
			focus: "rgba(75, 85, 99, 0.12)",
			primaryGhost: "rgba(75, 85, 99, 0.1)",
			primaryGradient: "linear-gradient(45deg, #4b5563, #8b95a5)",
			name: "石墨灰",
		},
		dark: {
			primary: "#8b95a5",
			primaryLight: "#4b5563",
			primaryBg: "#1a1c1f",
			hover: "#9ca5b3",
			focus: "rgba(139, 149, 165, 0.12)",
			primaryGhost: "rgba(139, 149, 165, 0.1)",
			primaryGradient: "linear-gradient(45deg, #8b95a5, #9ca5b3)",
			name: "石墨灰(暗色)",
		},
	},
};

export const mergedThemes = Object.keys(themes).reduce((acc, themeKey) => {
	acc[themeKey] = {
		light: {
			...BASE_COLORS.light,
			...themes[themeKey].light,
		},
		dark: {
			...BASE_COLORS.dark,
			...themes[themeKey].dark,
		},
	};
	return acc;
}, {});

export const defaultTheme = mergedThemes.blue.light;
