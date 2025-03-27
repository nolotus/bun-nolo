// create/editor/utils/slateUtils.ts
import { Node } from "slate"; // 确保导入 Node

// ================ 类型定义 ================
export type EditorContent = Array<{
  type: string;
  children: Array<{ text: string; [key: string]: any }>;
  [key: string]: any;
}>;

// ================ 工具函数 ================

/**
 * 比较两个 Slate 内容是否相同 (使用 Node.equals)
 * @param newContent 新内容
 * @param oldContent 旧内容
 * @returns {boolean} true 如果内容不同, false 如果内容相同
 */
export const compareSlateContent = (
  newContent: EditorContent | null,
  oldContent: EditorContent | null
): boolean => {
  try {
    // 快速引用检查
    if (newContent === oldContent) return false; // 相同
    // 空值检查
    if (!newContent || !oldContent) return true; // 不同
    // 长度检查
    if (newContent.length !== oldContent.length) return true; // 不同

    // 逐个比较顶层节点
    for (let i = 0; i < newContent.length; i++) {
      // 使用 Slate 的 Node.equals 进行深度比较
      // 类型断言确保兼容性
      if (!Node.equals(newContent[i] as Node, oldContent[i] as Node)) {
        return true; // 发现差异，内容不同
      }
    }
    return false; // 所有节点都相同，内容相同
  } catch (e) {
    console.warn("Slate 内容比较出错，将视为已变更:", e);
    return true; // 出错时，保守地认为内容已更改 (不同)
  }
};

/**
 * 从 Slate 数据中提取页面标题
 */
export const extractTitleFromSlate = (slateData: EditorContent): string => {
  if (!Array.isArray(slateData) || !slateData.length) return "新页面";

  // 首先查找 heading-one 元素
  const titleNode = slateData.find((node) => node.type === "heading-one");
  if (titleNode?.children?.[0]?.text) {
    const trimmedText = titleNode.children[0].text.trim();
    if (trimmedText) return trimmedText;
  }

  // 回退到查找第一个包含非空文本的块元素
  for (const node of slateData) {
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        if (child.text) {
          const trimmedText = child.text.trim();
          if (trimmedText) {
            return trimmedText.length > 30
              ? trimmedText.substring(0, 30) + "..."
              : trimmedText;
          }
        }
      }
    }
  }

  return "新页面";
};
