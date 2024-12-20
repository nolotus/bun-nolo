const plugin = require("tailwindcss/plugin");
module.exports = {
	content: [
		"./packages/web/**/*",
		"./packages/ui/**/*",
		"./packages/user/**/*",
		"./packages/components/**/*",
		"./packages/setting/**/*",
		"./packages/life/**/*",
		"./packages/render/**/*",
		"./packages/ai/**/*",
		"./packages/auth/**/*",
	],
	safelist: [
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
};
