// /ai/tools/createPageTool.ts (已更新至新架构)

import { createPage } from "render/page/pageSlice";
import { selectCurrentSpaceId } from "create/space/spaceSlice";
import type { RootState } from "app/store";

/**
 * [Schema] 定义了 'createPage' 工具的结构，供 LLM 调用。
 * 新增了可选的 'content' 参数。
 */
export const createPageFunctionSchema = {
  // 已从 'create_page' 更新为 'createPage'
  name: "createPage",
  description: "在当前空间中创建一个新页面，可以指定标题、分类和初始内容。",
  parameters: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "页面标题。如果未提供，将使用默认标题。",
      },
      categoryId: {
        type: "string",
        description: "页面所属的分类ID。此为可选参数。",
      },
      content: {
        type: "string",
        description: "页面的初始内容，支持Markdown格式。此为可选参数。",
      },
    },
    // 没有必填项，LLM可以灵活调用
    required: [],
  },
};

/**
 * [Executor] 'createPage' 工具的执行函数。
 * @param args - LLM 提供的参数: { title?: string, categoryId?: string, content?: string }
 * @param thunkApi - Redux Thunk API
 * @returns {Promise<{rawData: object, displayData: string}>} - 返回标准化的结果对象
 */
export async function createPageFunc(
  args: { title?: string; categoryId?: string; content?: string },
  thunkApi: any
): Promise<{ rawData: object; displayData: string }> {
  const { dispatch, getState } = thunkApi;
  const state = getState() as RootState;
  const spaceId = selectCurrentSpaceId(state);

  if (!spaceId) {
    throw new Error("无法创建页面，因为当前空间未设定。");
  }

  // 为参数提供默认值和安全处理
  const title = args.title?.trim() || "新页面";
  const categoryId = args.categoryId;
  const content = args.content; // 直接传递 content

  try {
    // 调用 createPage thunk，并传递所有参数
    const id = await dispatch(
      createPage({ spaceId, title, categoryId, content })
    ).unwrap();

    const rawData = { success: true, id, title };
    const displayData = `页面《${title}》已成功创建。`;

    // 返回标准化的结果对象
    return { rawData, displayData };
  } catch (error: any) {
    const msg = error?.message || JSON.stringify(error) || "未知错误";
    throw new Error(`创建页面时出错: ${msg}`);
  }
}
