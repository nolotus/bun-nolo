import { Descendant } from "slate";

/**
 * 将纯文本字符串转换为 Slate.js 编辑器兼容的节点数组格式。
 *
 * 这个函数会将输入文本按换行符 `\n` 分割，并将每一行文本转换为一个独立的
 * Slate `paragraph` 节点。这种结构是 Slate.js 用于表示富文本文档的基础。
 *
 * @param textContent - 从 .txt 文件或任何其他来源读取的纯文本内容。
 * @returns Slate.js 格式的节点数组 (Descendant[])。如果输入为空或无效，
 *          它会返回一个代表空文档的有效 Slate 结构。
 */
export const convertTxtToSlate = (textContent: string): Descendant[] => {
  // 1. 处理边缘情况：
  // 如果输入是 null、undefined 或者一个空字符串，返回一个标准的 Slate 空文档结构。
  // 这可以防止下游消费者（如 Slate 编辑器）因接收到无效数据而崩溃。
  // 一个标准的空文档包含一个空的段落。
  if (!textContent) {
    return [{ type: "paragraph", children: [{ text: "" }] }];
  }

  // 2. 分割文本为行：
  // 使用换行符 `\n` 作为分隔符，将整个文本块分割成一个字符串数组。
  // `split` 方法能很好地处理各种情况，包括末尾的换行符。
  const lines = textContent.split("\n");

  // 3. 将每一行映射为 Slate 段落节点：
  // 遍历 `lines` 数组，对每一行文本执行转换。
  // `map` 函数会为每一行返回一个新的对象，这个对象就是 Slate 的 `paragraph` 节点。
  const slateContent: Descendant[] = lines.map((line) => ({
    // `type: 'paragraph'` 定义了这个节点的类型。
    type: "paragraph",
    // `children` 是一个数组，包含了这个段落内的所有子节点。
    // 对于纯文本转换，这里只有一个 `text` 节点。
    children: [{ text: line }],
  }));

  // 4. 返回最终的 Slate 节点数组
  return slateContent;
};
