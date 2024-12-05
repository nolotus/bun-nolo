import { fromMarkdown } from "mdast-util-from-markdown";
import { gfm } from "micromark-extension-gfm";
import { gfmFromMarkdown } from "mdast-util-gfm";

import { mdastToSlate } from "./mdastToSlate";

export function markdownToSlate(markdown: string) {
  // 输入校验
  if (!markdown || typeof markdown !== "string") {
    return null;
  }

  const mdastTree = fromMarkdown(markdown, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });
  return mdastToSlate(mdastTree);
}
