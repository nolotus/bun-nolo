// 文件路径: ai/tools/createCategoryTool.ts

import { addCategory, selectCurrentSpaceId } from "create/space/spaceSlice";

// Tool definition
export const createCategoryTool = {
  type: "function",
  function: {
    name: "create_category",
    description: "在当前空间中创建新分类",
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
  },
};

/**
 * 在当前空间中创建新分类的实现
 * @param args 工具参数 { name: string }
 * @param thunkApi Redux Thunk API { dispatch, getState }
 * @returns Promise<{ success: true, id: string, name: string } | never> - 成功时返回包含 id 和 name 的对象，失败时抛出错误
 */
export const createCategoryFunc = async (
  args: { name: string },
  thunkApi: any // 替换 'any' 为你的实际 ThunkApi 类型
) => {
  const { dispatch, getState } = thunkApi;
  const state = getState(); // 假设 getState 返回 RootState
  const spaceId = selectCurrentSpaceId(state); // 获取当前空间ID
  const name = args.name?.trim() || "新分类"; // 提供默认名称以防空值
  console.log(`[createCategoryFunc] spaceId: ${spaceId}, name: ${name}`);

  if (!spaceId) {
    console.error("[createCategoryFunc] 创建分类失败：未找到当前空间ID");
    throw new Error("无法创建分类，因为当前空间未设定。");
  }

  try {
    // 调用 addCategoryAction action，并传入 spaceId
    console.log("[createCategoryFunc] Dispatching addCategoryAction...");
    const { spaceId: returnedSpaceId, updatedSpaceData } = await dispatch(
      addCategory({ spaceId, name })
    ).unwrap(); // unwrap 会在失败时抛出错误

    // 从 updatedSpaceData 中提取新创建的 categoryId (假设可以通过比较找到)
    const newCategoryId = Object.keys(updatedSpaceData.categories).find(
      (id) => updatedSpaceData.categories[id]?.name === name
    );

    console.log(
      `[createCategoryFunc] Category created successfully. categoryId: ${newCategoryId}`
    );

    // 返回结构化数据
    return {
      success: true, // 明确表示成功
      id: newCategoryId || "未知ID", // 返回分类 ID
      name: name, // 返回使用的分类名称
    };
  } catch (error: any) {
    console.error("[createCategoryFunc] 创建分类失败:", error);
    const errorMessage = error?.message || JSON.stringify(error) || "未知错误";
    throw new Error(`创建分类时出错: ${errorMessage}`);
  }
};
