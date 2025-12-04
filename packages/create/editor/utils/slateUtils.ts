import { Node } from "slate";

// ================ 类型定义 ================
export type EditorContent = Array<{
  type: string;
  children: Array<{ text: string; [key: string]: any }>;
  [key: string]: any;
}>;

// ================ 工具函数 ================

/**
 * 原生实现的深度比较
 * 仅考虑普通对象、数组、基本类型，适用于 Slate Node 这类 JSON 结构
 */
const deepEqual = (a: any, b: any): boolean => {
  // 引用相同或值相同（包含基本类型）
  if (a === b) return true;

  // 其中一个为 null 或 undefined
  if (a == null || b == null) return false;

  // 类型不同
  if (typeof a !== "object" || typeof b !== "object") return false;

  // 数组比较
  const isArrayA = Array.isArray(a);
  const isArrayB = Array.isArray(b);
  if (isArrayA || isArrayB) {
    if (!isArrayA || !isArrayB) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  // 普通对象比较
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }

  return true;
};

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

  // 使用原生 deepEqual 进行深度比较
  // deepEqual 返回 true 表示内容相同，所以需要取反
  return !deepEqual(newContent, oldContent);
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
    const text = Node.string(node).trim();
    if (text) {
      return text.length > 30 ? `${text.substring(0, 30)}...` : text;
    }
  }

  return "新页面";
};
