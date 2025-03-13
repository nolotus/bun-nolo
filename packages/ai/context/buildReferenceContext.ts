import { serialize } from "remark-slate";
import { read } from "database/dbSlice";

export const buildReferenceContext = async (cybotConfig, dispatch) => {
  let context = "";
  if (cybotConfig.references && cybotConfig.references.length > 0) {
    try {
      const referenceContents = await Promise.all(
        cybotConfig.references.map(async (ref) => {
          const refContent = await dispatch(read(ref.dbKey)).unwrap();
          const markdown = refContent.slateData
            .map((v) => serialize(v))
            .join("");
          return refContent
            ? `Title: ${ref.title}\nContent: ${markdown}\n\n`
            : `Title: ${ref.title}\n[Content not available]\n\n`;
        })
      );
      context = "Reference Context:\n" + referenceContents.join("");
    } catch (error) {
      console.error("Failed to fetch reference content:", error);
      context = cybotConfig.references
        .map(
          (ref) => `Title: ${ref.title}\n[Content unavailable due to error]\n\n`
        )
        .join("");
    }
  }
  return context;
};
