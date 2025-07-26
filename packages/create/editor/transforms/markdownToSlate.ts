// create/editor/transforms/markdownToSlate.ts

import { fromMarkdown } from "mdast-util-from-markdown";
import { gfmFromMarkdown } from "mdast-util-gfm";
import { gfm } from "micromark-extension-gfm";

// 1. 在导入时使用 `as` 关键字创建别名
import { mdastToSlate as convertMdastToSlate } from "./fromMarkdown";

/**
 * 将 Markdown 纯文本字符串转换为 Slate.js 的节点数组。
 * 这是一个高级别的入口函数，协调了两个主要步骤：
 * 1. Markdown 文本 -> MDAST (Markdown 抽象语法树)
 * 2. MDAST -> Slate.js 节点
 * @param markdown - 输入的 Markdown 字符串。
 * @returns Slate.js 节点数组，如果输入无效则返回 null。
 */
export function markdownToSlate(markdown: string) {
  // 输入验证保持不变
  if (!markdown || typeof markdown !== "string") {
    return null;
  }

  // 步骤 1: 将 Markdown 文本解析为 MDAST
  const mdastTree = fromMarkdown(markdown, {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });

  // 步骤 2: 使用重命名后的导入函数，将 MDAST 转换为 Slate 节点
  return convertMdastToSlate(mdastTree);
}
