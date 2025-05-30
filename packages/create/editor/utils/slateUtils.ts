// create/editor/utils/slateUtils.ts

// ================ 类型定义 ================
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

  // 长度检查
  if (newContent.length !== oldContent.length) return true; // 内容不同

  // 使用 JSON.stringify 进行深度比较
  return JSON.stringify(newContent) !== JSON.stringify(oldContent);
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
  if (titleNode?.children?.length > 0) {
    const text = titleNode.children[0].text || "";
    const trimmedText = text.trim();
    if (trimmedText) return trimmedText;
  }

  // 回退到查找第一个包含非空文本的块元素
  for (const node of slateData) {
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        const text = child.text || "";
        const trimmedText = text.trim();
        if (trimmedText) {
          return trimmedText.length > 30
            ? `${trimmedText.substring(0, 30)}...`
            : trimmedText;
        }
      }
    }
  }

  return "新页面";
};
