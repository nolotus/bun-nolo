// ai/tools/queryContentsByCategoryTool.ts

import { selectCurrentSpaceId } from "create/space/spaceSlice";
import type { RootState } from "app/store";

/**
 * [Schema] 定义了 'queryContentsByCategory' 工具的结构，供 LLM 调用。
 */
export const queryContentsByCategoryFunctionSchema = {
  name: "queryContentsByCategory",
  description: "查询当前空间中某个分类下的所有内容。",
  parameters: {
    type: "object",
    properties: {
      categoryId: {
        type: "string",
        description: "分类ID，可选，不提供则查询未分类内容",
      },
      filter: {
        type: "string",
        description: "标题关键字过滤，可选",
      },
    },
    required: [],
  },
};

/**
 * [Executor] 'queryContentsByCategory' 工具的执行函数。
 * @param args    LLM 提供的参数: { categoryId?: string; filter?: string }
 * @param thunkApi Redux Thunk API
 * @returns       Promise<{ rawData: { success: true; contents: any[] }; displayData: string }>
 */
export async function queryContentsByCategoryFunc(
  args: { categoryId?: string; filter?: string },
  thunkApi: any
): Promise<{
  rawData: { success: true; contents: any[] };
  displayData: string;
}> {
  const { getState } = thunkApi;
  const state = getState() as RootState;
  const spaceId = selectCurrentSpaceId(state);

  if (!spaceId) {
    throw new Error("无法查询内容，因为当前空间未设定。");
  }

  // 假设当前空间数据存在于 state.space.currentSpace
  const currentSpace: any = (state as any).space.currentSpace;
  if (!currentSpace) {
    throw new Error("当前空间数据未找到。");
  }

  let list = Object.values(currentSpace.contents || {});
  if (args.categoryId != null) {
    list = list.filter((c: any) => c.categoryId === args.categoryId);
  } else {
    list = list.filter((c: any) => !c.categoryId);
  }
  if (args.filter) {
    const kw = args.filter.toLowerCase();
    list = list.filter((c: any) => (c.title ?? "").toLowerCase().includes(kw));
  }

  const rawData = { success: true, contents: list };
  const displayData = `共查询到 ${list.length} 条内容。`;
  return { rawData, displayData };
}
