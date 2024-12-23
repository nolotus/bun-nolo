import postCssPlugin from "esbuild-style-plugin";
import { isProduction } from "utils/env";
const inputPath = "./packages/web/entry.tsx";

// 定义公共配置

export const commonConfig = {
	entryPoints: [inputPath],
	outdir: "public/assets",
	plugins: [
		postCssPlugin({
			postcss: {
				plugins: [require("tailwindcss")],
			},
		}),
	],
	bundle: true,
	splitting: true,
	treeShaking: true,
	format: "esm",
	loader: {
		".js": "jsx",
		".webp": "file",
		".jpg": "file",
		".png": "file",
		".svg": "text",
	},
	metafile: true,
	// entryNames: "[dir]/[name]-[hash]",
	sourcemap: true,
};

// 定义生产环境特有配置
const prodConfig = {
	entryNames: "[dir]/[name]-[hash]",
	minify: true,
	sourcemap: false,
};

// 合并配置，如果是生产环境，添加 prodConfig
export const config = isProduction
	? { ...commonConfig, ...prodConfig }
	: commonConfig;
