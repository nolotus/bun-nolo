import { ModeType } from "ai/types";

export const getModefromContent = (content: string, message): ModeType => {
	const generateImagePattern = /^生成.*图片/;
	const surfModePattern = /查看海浪条件/;
	if (surfModePattern.test(content)) {
		return "surf"; // 如果符合surf模式的判定条件则设置为 'surf'
	}
	if (
		generateImagePattern.test(content.split("\n")[0]) ||
		content.split("\n")[0].includes("生成图片")
	) {
		return "image";
	}
	const hasImageUrl = message.content.some((item) => item.type === "image_url");

	if (hasImageUrl) {
		return "vision";
	}
	return "stream";
};
