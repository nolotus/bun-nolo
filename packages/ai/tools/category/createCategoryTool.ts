// ai/tools/createCategoryTool.ts

import { addCategory, selectCurrentSpaceId } from "create/space/spaceSlice";
import type { RootState } from "app/store";

/**
 * [Schema] 定义了 'createCategory' 工具的结构，供 LLM 调用。
 */
export const createCategoryFunctionSchema = {
  // 已从 'create_category' 更新为 'createCategory'
  name: "createCategory",
  description: "在当前空间中创建新分类。",
  parameters: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "分类名称",
      },
    },
    required: ["name"],
  },
};

/**
 * [Executor] 'createCategory' 工具的执行函数。
 * @param args    LLM 提供的参数: { name: string }
 * @param thunkApi Redux Thunk API
 * @returns       Promise<{ rawData: object, displayData: string }>
 */
export async function createCategoryFunc(
  args: { name: string },
  thunkApi: any
): Promise<{
  rawData: { success: true; id: string; name: string };
  displayData: string;
}> {
  const { dispatch, getState } = thunkApi;
  const state = getState() as RootState;
  const spaceId = selectCurrentSpaceId(state);

  if (!spaceId) {
    throw new Error("无法创建分类，因为当前空间未设定。");
  }

  const name = args.name.trim() || "新分类";

  try {
    const { updatedSpaceData } = await dispatch(
      addCategory({ spaceId, name })
    ).unwrap();

    // 从 updatedSpaceData 中找到新分类的 ID
    const newCategoryId =
      Object.keys(updatedSpaceData.categories).find(
        (id) => updatedSpaceData.categories[id]?.name === name
      ) || "";

    const rawData = { success: true, id: newCategoryId, name };
    const displayData = `分类「${name}」已成功创建。`;
    return { rawData, displayData };
  } catch (error: any) {
    const msg = error?.message || JSON.stringify(error) || "未知错误";
    throw new Error(`创建分类时出错: ${msg}`);
  }
}
