import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { gfm } from "micromark-extension-gfm";

import { mdastToSlate } from "./mdastToSlate";

// 导出 markdown 转 slate 函数
export function markdownToSlate(markdown: string) {
	if (!markdown || typeof markdown !== "string") {
		return null;
	}

	const mdastTree = fromMarkdown(markdown, {
		extensions: [gfm()],
		mdastExtensions: [gfmFromMarkdown()],
	});
	return mdastToSlate(mdastTree);
}
