import { read } from "database/dbSlice";
// 导入我们新建的两个转换工具
import { slateToText } from "create/editor/transforms/slateToText";
import { slateToSimplifiedMarkdown } from "create/editor/transforms/slateToSimplifiedMarkdown";

// 定义函数的选项接口，提供三种格式选项
interface FetchOptions {
  format?: "json" | "text" | "simplified_markdown";
}

/**
 * 智能地获取并格式化参考内容。
 * @param references - DB Key 数组。
 * @param dispatch - Redux dispatch 函数。
 * @param options - 格式化选项，默认为 'json'。
 * @returns 拼接好的、格式化的参考内容字符串，或在无有效内容时返回 null。
 */
export const fetchReferenceContents = async (
  references: string[],
  dispatch: any,
  options: FetchOptions = { format: "simplified_markdown" }
): Promise<string | null> => {
  if (!references || references.length === 0) {
    return null;
  }

  const referencePromises = references.map(async (dbKey) => {
    try {
      const refContent = await dispatch(read(dbKey)).unwrap();

      if (!refContent?.slateData) {
        console.warn(`No slateData found for dbKey: ${dbKey}. Skipping.`);
        return null;
      }

      const title = refContent.title || `Untitled (${dbKey})`;

      let contentString: string;
      let contentType: string;

      // 核心的智能切换逻辑
      switch (options.format) {
        case "text":
          contentType = "Plain Text";
          contentString = slateToText(refContent.slateData);
          break;
        case "simplified_markdown":
          contentType = "Simplified Markdown";
          contentString = slateToSimplifiedMarkdown(refContent.slateData);
          break;
        case "json":
        default:
          contentType = "Slate JSON";
          contentString = JSON.stringify(refContent.slateData, null, 2);
          break;
      }

      // 统一的空内容检查
      if (
        !contentString ||
        (typeof contentString === "string" && !contentString.trim()) ||
        contentString === "[]"
      ) {
        return null;
      }

      const tags =
        refContent.tags?.length > 0 ? refContent.tags.join(", ") : "None";
      const createdAt = refContent.created || "Unknown Creation Date";
      const updatedAt = refContent.updated || "Unknown Update Date";

      return (
        `Reference Item:\n` +
        `DB Key: ${dbKey}\n` +
        `Title: ${title}\n` +
        `Content (${contentType}):\n${contentString}\n` +
        `Tags: ${tags}\n` +
        `Created At: ${createdAt}\n` +
        `Updated At: ${updatedAt}\n` +
        `---\n\n`
      );
    } catch (error) {
      console.error(`Failed to fetch reference content for ${dbKey}:`, error);
      return null;
    }
  });

  const resolvedContents = await Promise.all(referencePromises);
  const validContents = resolvedContents.filter(
    (content): content is string => content !== null
  );

  if (validContents.length === 0) {
    return null;
  }

  return validContents.join("");
};
