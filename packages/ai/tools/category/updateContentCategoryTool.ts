// ai/tools/updateContentCategoryTool.ts

import {
  updateContentCategory,
  selectCurrentSpaceId,
} from "create/space/spaceSlice";
import type { RootState } from "app/store";

/**
 * [Schema] 定义了 'updateContentCategory' 工具的结构，供 LLM 调用。
 */
export const updateContentCategoryFunctionSchema = {
  name: "updateContentCategory",
  description: "更新当前空间中某个内容的分类。",
  parameters: {
    type: "object",
    properties: {
      contentId: {
        type: "string",
        description: "要更新的内容ID",
      },
      categoryId: {
        type: "string",
        description: "新的分类ID，可选，不提供则设为未分类",
      },
    },
    required: ["contentId"],
  },
};

/**
 * [Executor] 'updateContentCategory' 工具的执行函数。
 * @param args    LLM 提供的参数: { contentId: string; categoryId?: string }
 * @param thunkApi Redux Thunk API
 * @returns       Promise<{ rawData: { success: true; id: string; categoryId?: string }; displayData: string }>
 */
export async function updateContentCategoryFunc(
  args: { contentId: string; categoryId?: string },
  thunkApi: any
): Promise<{
  rawData: { success: true; id: string; categoryId?: string };
  displayData: string;
}> {
  const { dispatch, getState } = thunkApi;
  const state = getState() as RootState;
  const spaceId = selectCurrentSpaceId(state);

  if (!spaceId) {
    throw new Error("无法更新分类，因为当前空间未设定。");
  }
  if (!args.contentId.trim()) {
    throw new Error("无法更新分类，因为内容ID未提供。");
  }

  try {
    const updatedId = await dispatch(
      updateContentCategory({
        spaceId,
        contentId: args.contentId,
        categoryId: args.categoryId || undefined,
      })
    ).unwrap();

    const rawData = {
      success: true,
      id: updatedId,
      categoryId: args.categoryId || undefined,
    };
    const displayData = `内容 ${updatedId} 的分类已更新为「${args.categoryId ?? "未分类"}」。`;
    return { rawData, displayData };
  } catch (err: any) {
    const msg = err?.message ?? JSON.stringify(err) ?? "未知错误";
    throw new Error(`更新分类时出错: ${msg}`);
  }
}
