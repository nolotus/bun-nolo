import { serialize } from "remark-slate";
import { read } from "database/dbSlice";

export const fetchReferenceContents = async (
  references: string[],
  dispatch: any
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
      const markdown =
        refContent.slateData.map((v: any) => serialize(v)).join("") || "";

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

  // 移除了 "Context Information:" 标题，因为现在由 generatePrompt 动态生成更具体的标题
  return validContents.join("");
};
