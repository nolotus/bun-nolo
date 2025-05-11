import { updateContentTitle } from "create/space/spaceSlice"; // 假设有一个对应的 action
import { selectCurrentSpaceId } from "create/space/spaceSlice";

// Tool definition
export const updateContentTitleTool = {
  type: "function",
  function: {
    name: "update_content_title",
    description: "更新当前空间中某个内容的标题",
    parameters: {
      type: "object",
      properties: {
        contentId: {
          type: "string",
          description: "要更新的内容ID",
        },
        title: {
          type: "string",
          description: "新的页面标题",
        },
      },
      required: ["contentId", "title"],
    },
  },
};

/**
 * 更新当前空间中某个内容标题的实现
 * @param args 工具参数 { contentId: string, title: string }
 * @param thunkApi Redux Thunk API { dispatch, getState }
 * @returns Promise<{ success: true, id: string, title: string } | never> - 成功时返回包含 id 和新标题的对象，失败时抛出错误
 */
export const updateContentTitleFunc = async (
  args: { contentId: string; title: string },
  thunkApi: any /* Replace 'any' with your actual ThunkApi type */
) => {
  const { dispatch, getState } = thunkApi;
  const state = getState(); // Assuming getState returns RootState
  const spaceId = selectCurrentSpaceId(state); // 获取当前空间ID
  const { contentId, title } = args;

  console.log(
    `[updateContentTitleFunc] spaceId: ${spaceId}, contentId: ${contentId}, title: ${title}`
  );

  if (!spaceId) {
    console.error("[updateContentTitleFunc] 更新标题失败：未找到当前空间ID");
    throw new Error("无法更新标题，因为当前空间未设定。");
  }

  if (!contentId) {
    console.error("[updateContentTitleFunc] 更新标题失败：未提供内容ID");
    throw new Error("无法更新标题，因为内容ID未提供。");
  }

  try {
    // 调用 updateContentTitle action (直接从 spaceSlice 中导入)
    console.log(
      "[updateContentTitleFunc] Dispatching updateContentTitle action..."
    );
    const updatedContentId = await dispatch(
      updateContentTitle({
        spaceId,
        contentId,
        title: title.trim(), // 确保标题去除首尾空格
      })
    ).unwrap(); // unwrap 会在失败时抛出错误

    console.log(
      `[updateContentTitleFunc] Content title updated successfully. contentId: ${updatedContentId}`
    );

    // 返回结构化数据
    return {
      success: true, // 明确表示成功
      id: updatedContentId, // 返回内容ID
      title: title, // 返回使用的新标题
    };
  } catch (error: any) {
    console.error("[updateContentTitleFunc] 更新标题失败:", error);
    const errorMessage = error?.message || JSON.stringify(error) || "未知错误";
    throw new Error(`更新标题时出错: ${errorMessage}`);
  }
};
