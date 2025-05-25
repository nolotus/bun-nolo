import { createPageFunc } from "ai/tools/createPageTool";
import { createCategoryFunc } from "ai/tools/createCategoryTool";
import { generateTable } from "ai/tools/generateTableTool";
import { fetchWebpage } from "ai/tools/fetchWebpageTool"; // 新增导入
import { selectCurrentUserId } from "auth/authSlice";

// 工具处理函数映射表
export const toolHandlers: Record<
  string,
  (args: any, thunkApi: any) => Promise<any>
> = {
  generate_table: async (args, thunkApi) => {
    const { getState } = thunkApi;
    const currentUserId = selectCurrentUserId(getState());
    return generateTable(args, thunkApi, currentUserId);
  },
  create_page: createPageFunc,
  create_category: createCategoryFunc,
  generate_image: async (args, thunkApi) => {
    // TODO: 实际图像生成逻辑
    return {
      success: true,
      id: `img_${Date.now()}`,
      name: "生成的图片",
      // 占位符，实际应返回图像数据
    };
  },
  fetch_webpage: async (args, thunkApi) => {
    const { getState } = thunkApi;
    const currentUserId = selectCurrentUserId(getState());
    return fetchWebpage(args, thunkApi, currentUserId);
  }, // 新增工具处理函数
};
