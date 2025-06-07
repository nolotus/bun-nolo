// buildReferenceContext.js (或你的文件名)

import { serialize } from "remark-slate";
import { read } from "database/dbSlice";

// 从 references 获取具体的数据结构，并返回 AI 可能需要的所有数据
// *** 返回类型修改为 Promise<string | null> ***
export const fetchReferenceContents = async (
  references: string[],
  dispatch: any
): Promise<string | null> => {
  // <--- 修改点 1: 返回类型
  console.log("fetchReferenceContents - input references:", references);

  // 如果 references 数组为空，直接返回 null
  if (!references || references.length === 0) {
    console.log(
      "fetchReferenceContents - no references provided, returning null"
    );
    return null; // <--- 修改点 2: 返回 null
  }

  const referencePromises = references.map(async (dbKey) => {
    try {
      console.log(
        `fetchReferenceContents - processing ref with dbKey: ${dbKey}`
      );

      const refContent = await dispatch(read(dbKey)).unwrap();

      // 如果读取不到内容或内容不完整，则认为此项无效，返回 null
      if (!refContent?.slateData) {
        console.warn(`No slateData found for dbKey: ${dbKey}. Skipping.`);
        return null;
      }

      const title = refContent.title || `Untitled (${dbKey})`;
      const markdown =
        refContent.slateData.map((v: any) => serialize(v)).join("") || "";

      // 如果没有实际内容，也跳过
      if (!markdown.trim()) {
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
        `Content: ${markdown}\n` +
        `Tags: ${tags}\n` +
        `Created At: ${createdAt}\n` +
        `Updated At: ${updatedAt}\n` +
        `---\n\n`
      );
    } catch (error) {
      console.error(`Failed to fetch reference content for ${dbKey}:`, error);
      // 如果获取失败，返回 null，以便后续过滤掉
      return null; // <--- 修改点 3: 错误时返回 null
    }
  });

  const resolvedContents = await Promise.all(referencePromises);

  // 过滤掉所有为 null 的结果 (空的、读取失败的等)
  const validContents = resolvedContents.filter((content) => content !== null);

  // 如果过滤后没有任何有效内容，返回 null
  if (validContents.length === 0) {
    console.log(
      "fetchReferenceContents - No valid content found after fetching. Returning null."
    );
    return null; // <--- 修改点 4: 没有有效内容时返回 null
  }

  // 只有在有实际内容时，才构建并返回完整的上下文字符串
  return (
    "Context Information:\n" + // 将标题移到这里，使其与内容绑定
    validContents.join("")
  );
};
