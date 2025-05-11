import { updateContentCategory } from "create/space/spaceSlice";
import { selectCurrentSpaceId } from "create/space/spaceSlice";

// Tool definition
export const updateContentCategoryTool = {
  type: "function",
  function: {
    name: "update_content_category",
    description: "更新当前空间中某个内容的分类",
    parameters: {
      type: "object",
      properties: {
        contentId: {
          type: "string",
          description: "要更新的内容ID",
        },
        categoryId: {
          type: "string",
          description: "新的分类ID，可选，默认为未分类",
        },
      },
      required: ["contentId"],
    },
  },
};

/**
 * 更新当前空间中某个内容分类的实现
 * @param args 工具参数 { contentId: string, categoryId?: string }
 * @param thunkApi Redux Thunk API { dispatch, getState }
 * @returns Promise<{ success: true, id: string, categoryId?: string } | never> - 成功时返回包含 id 和新分类ID的对象，失败时抛出错误
 */
export const updateContentCategoryFunc = async (
  args: { contentId: string; categoryId?: string },
  thunkApi: any /* Replace 'any' with your actual ThunkApi type */
) => {
  const { dispatch, getState } = thunkApi;
  const state = getState(); // Assuming getState returns RootState
  const spaceId = selectCurrentSpaceId(state); // 获取当前空间ID
  const { contentId, categoryId } = args;

  console.log(
    `[updateContentCategoryFunc] spaceId: ${spaceId}, contentId: ${contentId}, categoryId: ${categoryId || "未分类"}`
  );

  if (!spaceId) {
    console.error("[updateContentCategoryFunc] 更新分类失败：未找到当前空间ID");
    throw new Error("无法更新分类，因为当前空间未设定。");
  }

  if (!contentId) {
    console.error("[updateContentCategoryFunc] 更新分类失败：未提供内容ID");
    throw new Error("无法更新分类，因为内容ID未提供。");
  }

  try {
    // 调用 updateContentCategory action (直接从 spaceSlice 中导入)
    console.log(
      "[updateContentCategoryFunc] Dispatching updateContentCategory action..."
    );
    const updatedContentId = await dispatch(
      updateContentCategory({
        spaceId,
        contentId,
        categoryId: categoryId || undefined, // 可选分类ID
      })
    ).unwrap(); // unwrap 会在失败时抛出错误

    console.log(
      `[updateContentCategoryFunc] Content category updated successfully. contentId: ${updatedContentId}`
    );

    // 返回结构化数据
    return {
      success: true, // 明确表示成功
      id: updatedContentId, // 返回内容ID
      categoryId: categoryId || undefined, // 返回使用的新分类ID（如果有更新）
    };
  } catch (error: any) {
    console.error("[updateContentCategoryFunc] 更新分类失败:", error);
    const errorMessage = error?.message || JSON.stringify(error) || "未知错误";
    throw new Error(`更新分类时出错: ${errorMessage}`);
  }
};
