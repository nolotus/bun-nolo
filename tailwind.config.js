const plugin = require("tailwindcss/plugin");
module.exports = {
	content: [
		"./packages/web/**/*",
		"./packages/ui/**/*",
		"./packages/user/**/*",
		"./packages/components/**/*",
		"./packages/chat/**/*",
		"./packages/setting/**/*",
		"./packages/life/**/*",
		"./packages/render/**/*",
		"./packages/create/**/*",
		"./packages/ai/**/*",
		"./packages/auth/**/*",
	],
	safelist: [
		"columns-3",
		"shadow-md",
		"shadow-xl",
		"pl-10",
		"pl-2",
		"focus:border-blue-500",
		"focus:outline-none",
		"w-full",
		"border",
		"rounded",
	],
	theme: {
		extend: {
			transitionTimingFunction: {
				snappy: "cubic-bezier(0,1,0.5,1)",
			},
			width: {
				13: "3.25rem", // 或者您需要的任何具体值
			},
			colors: {},
			display: ["group-hover"],
			boxShadow: {
				DEFAULT: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
				"2xl": " 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)",
			},
		},
	},
};
