// create/editor/slateUtils.ts

// ================ 类型定义 ================
export type EditorContent = Array<{
  type: string;
  children: Array<{ text: string; [key: string]: any }>;
  [key: string]: any;
}>;

// ================ 工具函数 ================

/**
 * 优化的内容差异检测算法
 * 专为Slate编辑器结构设计的高效对比方法
 */
export const hasContentChanged = (
  newContent: EditorContent | null,
  oldContent: EditorContent | null
): boolean => {
  // 快速引用检查
  if (newContent === oldContent) return false;

  // 空值检查
  if (!newContent || !oldContent) return true;

  // 长度检查
  if (newContent.length !== oldContent.length) return true;

  try {
    // 需要深度检查的块类型 (如表格、列表等复杂结构)
    const complexBlockTypes = new Set([
      "table",
      "numbered-list",
      "bulleted-list",
    ]);

    // 逐块检查
    for (let i = 0; i < newContent.length; i++) {
      const newNode = newContent[i];
      const oldNode = oldContent[i];

      // 类型检查
      if (newNode.type !== oldNode.type) return true;

      // 复杂块使用 JSON 字符串比较 (较少出现，所以性能影响小)
      if (complexBlockTypes.has(newNode.type)) {
        if (JSON.stringify(newNode) !== JSON.stringify(oldNode)) return true;
        continue;
      }

      // 标准块的内容检查
      if (Array.isArray(newNode.children) && Array.isArray(oldNode.children)) {
        if (newNode.children.length !== oldNode.children.length) return true;

        // 文本内容检查
        for (let j = 0; j < newNode.children.length; j++) {
          const newChild = newNode.children[j];
          const oldChild = oldNode.children[j];

          // 文本内容对比
          if (newChild.text !== oldChild.text) return true;

          // 格式化属性对比 (斜体、加粗等)
          const newKeys = Object.keys(newChild).filter((k) => k !== "text");
          const oldKeys = Object.keys(oldChild).filter((k) => k !== "text");

          if (newKeys.length !== oldKeys.length) return true;

          for (const key of newKeys) {
            if (newChild[key] !== oldChild[key]) return true;
          }
        }
      } else {
        // 结构不一致，视为已更改
        return true;
      }
    }

    return false; // 所有检查都通过，内容相同
  } catch (e) {
    console.warn("内容比较出错，将视为已变更:", e);
    return true;
  }
};

/**
 * 从 Slate 数据中提取页面标题
 * (如果你想把这个也移过来，也可以放在这里)
 */
export const extractTitleFromSlate = (slateData: EditorContent): string => {
  if (!Array.isArray(slateData) || !slateData.length) return "新页面";

  // 首先查找 heading-one 元素
  const titleNode = slateData.find((node) => node.type === "heading-one");
  if (titleNode?.children?.[0]?.text) {
    return titleNode.children[0].text;
  }

  // 回退到第一个段落或其他元素
  const firstNode = slateData[0];
  if (firstNode?.children?.[0]?.text) {
    // 截取合适长度作为标题
    const text = firstNode.children[0].text;
    return text.length > 30 ? text.substring(0, 30) + "..." : text;
  }

  return "新页面";
};
