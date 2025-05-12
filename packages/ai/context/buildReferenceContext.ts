import { serialize } from "remark-slate";
import { read } from "database/dbSlice";

// 从 references 获取具体的数据结构，并返回 AI 可能需要的所有数据
export const fetchReferenceContents = async (
  references: string[],
  dispatch: any
): Promise<string> => {
  console.log("fetchReferenceContents - input references:", references);
  // 如果 references 为空，直接返回空上下文
  if (!references || references.length === 0) {
    console.log(
      "fetchReferenceContents - no references provided, returning empty context"
    );
    return "Reference Context:\n[No reference content available]\n";
  }

  const referenceContents = await Promise.all(
    references.map(async (dbKey) => {
      try {
        console.log(
          `fetchReferenceContents - processing ref with dbKey: ${dbKey}`
        );

        // 从数据库读取内容
        const refContent = await dispatch(read(dbKey)).unwrap();

        // 提取 AI 可能需要的字段，处理空值情况
        const title = refContent?.title || `Unknown Title for ${dbKey}`;
        const markdown =
          refContent?.slateData?.map((v: any) => serialize(v)).join("") ||
          "[Content not available]";
        const tags =
          refContent?.tags?.length > 0 ? refContent.tags.join(", ") : "None";
        const createdAt = refContent?.created || "Unknown Creation Date";
        const updatedAt = refContent?.updated || "Unknown Update Date";

        // 构建详细的上下文字符串，包含所有 AI 可能需要的字段
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
        return (
          `Reference Item:\n` +
          `DB Key: ${dbKey}\n` +
          `Title: Unknown Title for ${dbKey}\n` +
          `[Content unavailable due to error]\n` +
          `---\n\n`
        );
      }
    })
  );

  return (
    "Reference Context:\n\n" +
    (referenceContents.length > 0
      ? referenceContents.join("")
      : "[No reference content available]\n")
  );
};
