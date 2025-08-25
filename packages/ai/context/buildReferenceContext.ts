// ai/context/fetchReferenceContents.ts

import { read } from "database/dbSlice";
// AppDispatch 类型通常从 store 中导出，确保路径正确
import { AppDispatch } from "app/store";
import { slateToText } from "create/editor/transforms/slateToText";
import { slateToSimplifiedMarkdown } from "create/editor/transforms/slateToSimplifiedMarkdown";

interface FetchOptions {
  format?: "json" | "text" | "simplified_markdown";
}

/**
 * 智能地获取并格式化参考内容。
 * @param references - DB Key 数组。
 * @param dispatch - Redux dispatch 函数。
 * @param options - 格式化选项，默认为 'simplified_markdown'。
 * @returns 一个 Map，key 是 dbKey，value 是格式化后的内容字符串。
 */
export const fetchReferenceContents = async (
  references: string[],
  dispatch: AppDispatch,
  options: FetchOptions = { format: "simplified_markdown" }
  // <--- 改动 1: 更改返回类型
): Promise<Map<string, string>> => {
  const emptyMap = new Map<string, string>();
  if (!references || references.length === 0) {
    return emptyMap;
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

      const formattedContent =
        `Reference Item:\n` +
        `DB Key: ${dbKey}\n` +
        `Title: ${title}\n` +
        `Content (${contentType}):\n${contentString}\n` +
        `Tags: ${tags}\n` +
        `Created At: ${createdAt}\n` +
        `Updated At: ${updatedAt}\n` +
        `---\n\n`;

      // <--- 改动 2: 返回一个元组 [key, value] 以便后续创建 Map
      return [dbKey, formattedContent];
    } catch (error) {
      console.error(`Failed to fetch reference content for ${dbKey}:`, error);
      return null;
    }
  });

  const resolvedContents = await Promise.all(referencePromises);

  // <--- 改动 3: 过滤掉 null，并断言类型为元组数组
  const validContents = resolvedContents.filter(
    (content): content is [string, string] => content !== null
  );

  if (validContents.length === 0) {
    return emptyMap;
  }

  // <--- 改动 4: 从元组数组创建一个新的 Map 并返回
  return new Map(validContents);
};
