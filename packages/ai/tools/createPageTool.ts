// 文件路径: ai/tools/createPageTool.ts

import { createPage } from "render/page/pageSlice";
import { selectCurrentSpaceId } from "create/space/spaceSlice";

// Tool 定义，新增 content 参数
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
          description: "分类ID，可选",
        },
        content: {
          type: "string",
          description: "页面初始内容，可选",
        },
      },
      required: [],
    },
  },
};

/**
 * 在当前空间中创建页面
 * @param {{ title?: string, categoryId?: string, content?: string }} args
 * @param {{ dispatch: Function, getState: Function }} thunkApi
 */
export async function createPageFunc(args, thunkApi) {
  const { dispatch, getState } = thunkApi;
  const state = getState();
  const spaceId = selectCurrentSpaceId(state);

  if (!spaceId) {
    throw new Error("无法创建页面，因为当前空间未设定。");
  }

  const title = args.title?.trim() || "新页面";
  const categoryId = args.categoryId;
  const content = args.content;

  try {
    // 透传 content 给 createPage thunk
    const id = await dispatch(
      createPage({ spaceId, title, categoryId, content })
    ).unwrap();

    return { success: true, id, title };
  } catch (error) {
    const msg = error?.message || JSON.stringify(error) || "未知错误";
    throw new Error(`创建页面时出错: ${msg}`);
  }
}
