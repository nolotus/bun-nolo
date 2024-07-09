import { ModeType } from "ai/types";

export const getModefromContent = (text: string, content): ModeType => {
  const generateImagePattern = /^生成.*图片/;
  const surfModePattern = /查看海浪条件/;
  if (surfModePattern.test(text)) {
    return "surf";
  }
  if (
    generateImagePattern.test(text.split("\n")[0]) ||
    text.split("\n")[0].includes("生成图片")
  ) {
    return "image";
  }
  const hasImageUrl =
    Array.isArray(content) && content.some((item) => item.type === "image_url");

  if (hasImageUrl) {
    return "vision";
  }
  return "stream";
};
