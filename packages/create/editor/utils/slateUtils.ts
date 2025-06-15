import { Node } from "slate";
// 【修改】从 rambda 导入 equals 函数
import { equals } from "rambda";

// ================ 类型定义 ================
// (类型定义保持不变)
export type EditorContent = Array<{
  type: string;
  children: Array<{ text: string; [key: string]: any }>;
  [key: string]: any;
}>;

// ================ 工具函数 ================

/**
 * 比较两个 Slate 内容是否相同
 * @param newContent 新内容
 * @param oldContent 旧内容
 * @returns {boolean} true 如果内容不同，false 如果内容相同
 */
export const compareSlateContent = (
  newContent: EditorContent | null,
  oldContent: EditorContent | null
): boolean => {
  // 快速引用检查
  if (newContent === oldContent) return false; // 内容相同，未发生变化

  // 空值检查
  if (!newContent || !oldContent) return true; // 内容不同

  // 长度检查 (作为另一层快速检查)
  if (newContent.length !== oldContent.length) return true; // 内容不同

  // 【修改】使用 rambda.equals 进行高性能的深度比较
  // equals 返回 true 表示内容相同，所以我们需要取反
  return !equals(newContent, oldContent);
};

/**
 * 从 Slate 数据中提取页面标题
 * @param slateData Slate 编辑器内容数据
 * @returns {string} 提取的标题或默认值 "新页面"
 */
export const extractTitleFromSlate = (slateData: EditorContent): string => {
  if (!Array.isArray(slateData) || slateData.length === 0) return "新页面";

  // 优先查找 heading-one 元素作为标题
  const titleNode = slateData.find((node) => node.type === "heading-one");

  if (titleNode) {
    // 使用 Slate 内置的 Node.string 工具，可靠地提取所有文本，即使标题中有格式
    const text = Node.string(titleNode).trim();
    if (text) {
      return text;
    }
  }

  // 回退到查找第一个包含非空文本的块元素
  for (const node of slateData) {
    // 同样使用 Node.string 进行可靠的文本提取
    const text = Node.string(node).trim();
    if (text) {
      return text.length > 30 ? `${text.substring(0, 30)}...` : text;
    }
  }

  return "新页面";
};
