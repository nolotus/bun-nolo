// 文件路径: ai/tools/createPageTool.ts

import { createPage } from "render/page/pageSlice";
import { selectCurrentSpaceId } from "create/space/spaceSlice";

export const createPageTool = {
  type: "function",
  function: {
    name: "create_page",
    description: "在当前空间中创建新页面",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "页面标题，可选",
        },
        categoryId: {
          type: "string",
          description: "分类ID，可选，默认为未分类",
        },
      },
      required: [],
    },
  },
};

/**
 * 在当前空间中创建新页面的实现
 * @param args 工具参数
 * @param thunkApi Redux Thunk API，用于获取状态和派发动作
 * @param currentUserId 当前用户ID
 * @returns 成功消息
 */
export const createPageFunc = async (args, thunkApi, currentUserId) => {
  const { dispatch, getState } = thunkApi;
  const state = getState();
  const spaceId = selectCurrentSpaceId(state); // 获取当前空间ID
  const title = args.title || "未命名页面";
  const categoryId = args.categoryId || undefined; // 可选分类ID
  console.log("createPageFunc");
  if (!spaceId) {
    throw new Error("创建页面失败：未找到当前空间ID");
  }

  try {
    // 调用 createPage 函数创建新页面
    const dbKey = await dispatch(
      createPage({
        spaceId,
        title,
        categoryId,
      })
    ).unwrap();

    // 返回成功消息
    return {
      type: "text",
      text: `页面已成功创建：${title} (页面ID: ${dbKey})`,
    };
  } catch (error) {
    throw new Error(`创建页面失败：${error.message}`);
  }
};
