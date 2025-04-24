// 文件路径: ai/tools/createPageTool.ts

import { createPage } from "render/page/pageSlice";
import { selectCurrentSpaceId } from "create/space/spaceSlice";
// *** 假设 ThunkApi 和 RootState 类型已定义 ***
// import { AppThunkAction, RootState } from 'path/to/store';
// import { AsyncThunk } from '@reduxjs/toolkit'; // 或具体类型

// Tool definition (no changes needed here)
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
 * @param args 工具参数 { title?: string, categoryId?: string }
 * @param thunkApi Redux Thunk API { dispatch, getState }
 * @returns Promise<{ success: true, id: string, title: string } | never> - 成功时返回包含 id 和 title 的对象，失败时抛出错误
 */
export const createPageFunc = async (
  args: { title?: string; categoryId?: string },
  thunkApi: any /* Replace 'any' with your actual ThunkApi type */
) /*: Promise<{ success: true; id: string; title: string }> */ => {
  const { dispatch, getState } = thunkApi;
  const state = getState(); // Assuming getState returns RootState
  const spaceId = selectCurrentSpaceId(state); // 获取当前空间ID
  // 提供一个更有意义的默认标题，如果AI没给的话
  const title = args.title?.trim() || "新页面";
  const categoryId = args.categoryId || undefined; // 可选分类ID
  console.log(
    `[createPageFunc] spaceId: ${spaceId}, title: ${title}, categoryId: ${categoryId}`
  );

  if (!spaceId) {
    console.error("[createPageFunc] 创建页面失败：未找到当前空间ID");
    // 抛出错误，让调用者处理
    throw new Error("无法创建页面，因为当前空间未设定。");
  }

  try {
    // 调用 createPage action (假设它是一个返回 dbKey 的 async thunk)
    // 使用 unwrap 来获取结果或捕获 rejection
    console.log("[createPageFunc] Dispatching createPage action...");
    const dbKey = await dispatch(
      createPage({
        spaceId,
        title,
        categoryId,
      })
    ).unwrap(); // unwrap 会在失败时抛出错误

    console.log(`[createPageFunc] Page created successfully. dbKey: ${dbKey}`);

    // *** 修改: 返回结构化数据，而不是预格式化的文本 ***
    return {
      success: true, // 明确表示成功
      id: dbKey, // 返回页面 ID (dbKey)
      title: title, // 返回使用的标题
    };
  } catch (error: any) {
    // unwrap() 会抛出序列化的 rejection 值或 Error 对象
    console.error("[createPageFunc] 创建页面失败:", error);
    // 重新抛出错误，包含更有用的信息
    // 检查 error 是否有 message 属性
    const errorMessage = error?.message || JSON.stringify(error) || "未知错误";
    throw new Error(`创建页面时出错: ${errorMessage}`);
  }
};
