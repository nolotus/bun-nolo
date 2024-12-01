import { fromMarkdown } from "mdast-util-from-markdown";
import { gfm } from "micromark-extension-gfm";
import { gfmFromMarkdown } from "mdast-util-gfm";

export function markdownToMdast(markdown: string) {
  // 输入校验
  if (!markdown || typeof markdown !== "string") {
    return null;
  }

  try {
    return fromMarkdown(markdown, {
      extensions: [gfm()],
      mdastExtensions: [gfmFromMarkdown()],
    });
  } catch (error) {
    console.warn("Markdown parsing failed:", error);
    return null;
  }
}
