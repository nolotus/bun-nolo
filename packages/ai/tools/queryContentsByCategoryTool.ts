import { selectCurrentSpaceId } from "create/space/spaceSlice";

// Tool definition
export const queryContentsByCategoryTool = {
  type: "function",
  function: {
    name: "query_contents_by_category",
    description: "查询当前空间中某个分类下的所有内容",
    parameters: {
      type: "object",
      properties: {
        categoryId: {
          type: "string",
          description: "分类ID，可选，若不提供则查询未分类内容",
        },
        filter: {
          type: "string",
          description: "筛选条件，如标题关键字，可选",
        },
      },
      required: [],
    },
  },
};

/**
 * 查询当前空间中某个分类下内容的实现
 * @param args 工具参数 { categoryId?: string, filter?: string }
 * @param thunkApi Redux Thunk API { dispatch, getState }
 * @returns Promise<{ success: true, contents: any[] } | never> - 成功时返回包含内容列表的对象，失败时抛出错误
 */
export const queryContentsByCategoryFunc = async (
  args: { categoryId?: string; filter?: string },
  thunkApi: any /* Replace 'any' with your actual ThunkApi type */
) => {
  const { dispatch, getState } = thunkApi;
  const state = getState(); // Assuming getState returns RootState
  const spaceId = selectCurrentSpaceId(state); // 获取当前空间ID
  const { categoryId, filter } = args;

  console.log(
    `[queryContentsByCategoryFunc] spaceId: ${spaceId}, categoryId: ${categoryId || "未分类"}, filter: ${filter || "无筛选条件"}`
  );

  if (!spaceId) {
    console.error(
      "[queryContentsByCategoryFunc] 查询内容失败：未找到当前空间ID"
    );
    throw new Error("无法查询内容，因为当前空间未设定。");
  }

  try {
    // 假设有一个 queryContents action 或直接从 state 中获取数据
    console.log("[queryContentsByCategoryFunc] Querying contents...");
    const contents = await dispatch(
      queryContents({
        spaceId,
        categoryId: categoryId || undefined,
        filter: filter || undefined,
      })
    ).unwrap(); // unwrap 会在失败时抛出错误

    console.log(
      `[queryContentsByCategoryFunc] Contents queried successfully. count: ${contents.length}`
    );

    // 返回结构化数据
    return {
      success: true, // 明确表示成功
      contents, // 返回查询到的内容列表
    };
  } catch (error: any) {
    console.error("[queryContentsByCategoryFunc] 查询内容失败:", error);
    const errorMessage = error?.message || JSON.stringify(error) || "未知错误";
    throw new Error(`查询内容时出错: ${errorMessage}`);
  }
};

// 假设有一个 queryContents action，用于从 Redux 中查询内容
const queryContents = (payload: {
  spaceId: string;
  categoryId?: string;
  filter?: string;
}) => {
  return async (dispatch: any, getState: any) => {
    const state = getState();
    const currentSpace = state.space.currentSpace; // 假设 state 中有当前空间的数据
    if (!currentSpace) {
      throw new Error("当前空间数据未找到");
    }

    let contents = Object.values(currentSpace.contents || {}).filter(
      (content) => content !== null
    );
    if (payload.categoryId) {
      contents = contents.filter(
        (content) => content?.categoryId === payload.categoryId
      );
    } else if (payload.categoryId === undefined) {
      contents = contents.filter((content) => !content?.categoryId);
    }

    if (payload.filter) {
      const filterLower = payload.filter.toLowerCase();
      contents = contents.filter((content) =>
        content?.title?.toLowerCase().includes(filterLower)
      );
    }

    return contents;
  };
};
