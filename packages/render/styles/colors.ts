// render/styles/colors.ts

export const BASE_COLORS = {
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

	// 图标
	icon: "#4a5568",

	// 状态相关
	error: "#ef4444",

	// 阴影相关
	shadowLight: "rgba(0,0,0,0.06)",
	shadowMedium: "rgba(0,0,0,0.08)",
	shadowHeavy: "rgba(0,0,0,0.1)",

	// 特殊用途
	dropZoneActive: "rgba(0, 98, 255, 0.08)",
};

// 头像等地方用的渐变色
export const GRADIENTS = {
	gray: "linear-gradient(135deg, #e6e9f0 0%, #eef1f5 100%)",
	blue: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
	purple: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
	white: "linear-gradient(135deg, #dfe9f3 0%, white 100%)",
};

export const themes = {
	blue: {
		primary: "#2563eb",
		primaryLight: "#6ea8ff",
		primaryBg: "#f0f7ff",
		hover: "#1e56d3",
		focus: "rgba(37, 99, 235, 0.12)",
		name: "默认蓝",
	},
	green: {
		primary: "#059669",
		primaryLight: "#47c199",
		primaryBg: "#f0fdf9",
		hover: "#048a5f",
		focus: "rgba(5, 150, 105, 0.12)",
		name: "清新绿",
	},
	purple: {
		primary: "#7c3aed",
		primaryLight: "#a586ff",
		primaryBg: "#f6f4ff",
		hover: "#6a31d1",
		focus: "rgba(124, 58, 237, 0.12)",
		name: "典雅紫",
	},
	pink: {
		primary: "#db2777",
		primaryLight: "#f17eae",
		primaryBg: "#fef1f7",
		hover: "#c32069",
		focus: "rgba(219, 39, 119, 0.12)",
		name: "温柔粉",
	},
	yellow: {
		primary: "#d97706",
		primaryLight: "#faa53d",
		primaryBg: "#fff9eb",
		hover: "#c16a05",
		focus: "rgba(217, 119, 6, 0.12)",
		name: "明亮黄",
	},
	red: {
		primary: "#dc2626",
		primaryLight: "#f47171",
		primaryBg: "#fff1f1",
		hover: "#c72020",
		focus: "rgba(220, 38, 38, 0.12)",
		name: "热情红",
	},
	orange: {
		primary: "#ea580c",
		primaryLight: "#ff8f4d",
		primaryBg: "#fff4ed",
		hover: "#d14e0a",
		focus: "rgba(234, 88, 12, 0.12)",
		name: "活力橙",
	},
	graphite: {
		primary: "#4b5563",
		primaryLight: "#8b95a5",
		primaryBg: "#f8fafb",
		hover: "#404a57",
		focus: "rgba(75, 85, 99, 0.12)",
		name: "石墨灰",
	},
};

export const mergedThemes = Object.keys(themes).reduce((acc, themeKey) => {
	acc[themeKey] = {
		...BASE_COLORS, // 基础颜色
		...themes[themeKey], // 主题颜色
	};
	return acc;
}, {});

export const defaultTheme = mergedThemes.red;
