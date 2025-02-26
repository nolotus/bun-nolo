// app/theme/red.ts
export const red = {
	light: {
	  primary: "#EF4444",            // 鲜明但不刺眼的红色
	  primaryLight: "#F87171",       // 较浅的红色
	  primaryBg: "#FEF2F2",          // 极浅的背景粉红
	  hover: "#DC2626",              // 深红交互色
	  focus: "rgba(239, 68, 68, 0.12)",
	  primaryGhost: "rgba(239, 68, 68, 0.08)", // 微调透明度
	  primaryGradient: "linear-gradient(45deg, #EF4444, #F87171)",
	  name: "典雅红",
	  primaryDark: "#DC2626",        // 与hover保持一致
	  primaryHover: "rgba(239, 68, 68, 0.12)" // 与focus保持一致
	},
	dark: {
	  primary: "#F87171",            // 明亮的红色
	  primaryLight: "#FCA5A5",       // 更柔和的浅红色
	  primaryBg: "#1C1917",          // 带暖调的深色背景
	  hover: "#EF4444",              // 互补的悬停色
	  focus: "rgba(248, 113, 113, 0.12)",
	  primaryGhost: "rgba(248, 113, 113, 0.1)",
	  primaryGradient: "linear-gradient(45deg, #F87171, #FCA5A5)",
	  name: "典雅红(暗色)",
	  primaryDark: "#EF4444",        // 与hover保持一致
	  primaryHover: "rgba(248, 113, 113, 0.12)" // 与focus保持一致
	}
  };
  