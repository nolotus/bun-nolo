// create/editor/transforms/markdownToSlate.ts

import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { gfm } from "micromark-extension-gfm";
import { mdastToSlate } from "./fromMarkdown";

/**
 * 将 Markdown 纯文本字符串转换为 Slate.js 的节点数组。
 * 1. Markdown 文本 -> MDAST (Markdown 抽象语法树)
 * 2. MDAST -> Slate.js 节点
 */
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
