import type { NoloRootState } from "app/store";
import {
  type PayloadAction,
  asyncThunkCreator,
  buildCreateSlice,
  createSelector, // 引入 createSelector
} from "@reduxjs/toolkit";
import {
  SpaceData,
  MemberRole,
  SpaceMemberWithSpaceInfo,
  SpaceCategory, // 确保导入 SpaceCategory 类型
} from "create/space/types";

// Actions (确保所有需要的 Action import 都在这里)
import { deleteSpaceAction } from "./action/deleteSpaceAction";
import { addContentAction } from "./action/addContentAction";
import { deleteContentFromSpaceAction } from "./action/deleteContentFromSpaceAction";
import { addSpaceAction } from "./action/addSpaceAction";
import { updateSpaceAction } from "./action/updateSpaceAction";
import { fetchUserSpaceMembershipsAction } from "./action/fetchUserSpaceMemberships";
import { addMemberAction } from "./action/addMemberAction";
import { removeMemberAction } from "./action/removeMemberAction";
import { addCategoryAction } from "./action/addCategoryAction";
import { deleteCategoryAction } from "./action/deleteCategoryAction";
import { updateCategoryNameAction } from "./action/updateCategoryNameAction";
import { reorderCategoriesAction } from "./action/reorderCategoriesAction";
import { fetchSpaceAction } from "./action/fetchSpaceAction";
import { updateContentCategoryAction } from "./action/updateContentCategoryAction";
import { loadDefaultSpaceAction } from "./action/loadDefaultSpaceAction";
import { moveContentAction } from "./action/moveContentAction";
import { updateContentTitleAction } from "./action/updateContentTitleAction";
import { read } from "database/dbSlice";
import { createSpaceKey } from "./spaceKeys";

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

// 定义 State 结构
interface SpaceState {
  currentSpaceId: string | null;
  currentSpace: SpaceData | null;
  memberSpaces: SpaceMemberWithSpaceInfo[] | null;
  loading: boolean;
  error?: string;
  initialized: boolean;
  // 存储当前 space 的分类折叠状态 { [categoryId: string]: boolean }
  // true 表示折叠, false 或 undefined 表示展开
  collapsedCategories: Record<string, boolean>;
}

// 初始 State
const initialState: SpaceState = {
  currentSpaceId: null,
  currentSpace: null,
  memberSpaces: null,
  loading: false,
  initialized: false,
  collapsedCategories: {}, // 初始化为空对象
};

// 创建 Slice
const spaceSlice = createSliceWithThunks({
  name: "space",
  initialState,
  reducers: (create) => ({
    // --- 切换 Space ---
    changeSpace: create.asyncThunk(
      async (spaceId: string, thunkAPI) => {
        const dispatch = thunkAPI.dispatch;
        const spaceKey = createSpaceKey.space(spaceId);
        // 使用 any 暂时避免类型问题，或者确保 read 返回类型正确
        const spaceData: SpaceData | null = (await dispatch(
          read(spaceKey)
        ).unwrap()) as SpaceData | null;
        if (!spaceData) {
          throw new Error("Space not found or failed to load");
        }
        return {
          spaceId,
          spaceData,
        };
      },
      {
        pending: (state) => {
          state.loading = true; // 可选：切换时也显示加载状态
          state.error = undefined; // 清除旧错误
        },
        fulfilled: (state, action) => {
          state.currentSpaceId = action.payload.spaceId;
          state.currentSpace = action.payload.spaceData;
          state.initialized = true;
          state.loading = false;
          // 重置折叠状态
          state.collapsedCategories = {};
        },
        rejected: (state, action) => {
          state.error = action.error.message || "Failed to change space";
          state.initialized = true; // 即使失败也标记为已初始化（尝试过加载）
          state.loading = false;
          state.currentSpaceId = null; // 清空当前 space 信息
          state.currentSpace = null;
          // 重置折叠状态
          state.collapsedCategories = {};
        },
      }
    ),

    // --- 新增：切换分类折叠状态 ---
    toggleCategoryCollapse: create.reducer(
      (state, action: PayloadAction<string>) => {
        const categoryId = action.payload;
        // 确保 categoryId 存在 (现在允许 "uncategorized")
        if (categoryId) {
          const currentCollapsed =
            state.collapsedCategories[categoryId] ?? false;
          // 创建新对象以保持不可变性
          state.collapsedCategories = {
            ...state.collapsedCategories,
            [categoryId]: !currentCollapsed,
          };
        }
      }
    ),

    // --- 其他现有 Reducers 和 Async Thunks ---

    addSpace: create.asyncThunk(addSpaceAction, {
      fulfilled: (state, action) => {
        if (state.memberSpaces) {
          state.memberSpaces.push(action.payload);
        } else {
          state.memberSpaces = [action.payload];
        }
        // 可选：如果添加的是第一个space，可以考虑自动切换并重置折叠状态
      },
      // 可选：添加 pending 和 rejected 处理
      pending: (state) => {
        state.loading = true;
      },
      rejected: (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      },
    }),

    addContentToSpace: create.asyncThunk(addContentAction, {
      fulfilled: (state, action) => {
        const { spaceId, updatedSpaceData } = action.payload;
        if (state.currentSpaceId === spaceId) {
          state.currentSpace = updatedSpaceData;
        }
      },
    }),

    moveContentToSpace: create.asyncThunk(moveContentAction, {
      fulfilled: (state, action) => {
        const { spaceId, updatedSpaceData } = action.payload;
        if (state.currentSpaceId === spaceId) {
          state.currentSpace = updatedSpaceData;
        }
      },
    }),

    fetchUserSpaceMemberships: create.asyncThunk(
      fetchUserSpaceMembershipsAction,
      {
        pending: (state) => {
          state.loading = true;
        },
        fulfilled: (state, action) => {
          state.memberSpaces = action.payload;
          state.loading = false;
        },
        rejected: (state, action) => {
          state.loading = false;
          state.error = action.error.message;
        },
      }
    ),

    deleteSpace: create.asyncThunk(deleteSpaceAction, {
      fulfilled: (state, action) => {
        const { spaceId } = action.payload;
        if (state.memberSpaces) {
          state.memberSpaces = state.memberSpaces.filter(
            (space) => space.spaceId !== spaceId
          );
        }
        if (spaceId === state.currentSpaceId) {
          state.currentSpace = null;
          state.currentSpaceId = null;
          state.collapsedCategories = {}; // 清空相关折叠状态
        }
        // 可选：如果删除了当前space，可以考虑切换到默认或第一个space
      },
    }),

    updateSpace: create.asyncThunk(updateSpaceAction, {
      fulfilled: (state, action) => {
        const { updatedSpace, spaceId } = action.payload;
        if (spaceId === state.currentSpaceId) {
          state.currentSpace = updatedSpace;
        }
        // 更新 memberSpaces 中的名称 (如果存在且名称已更新)
        if (state.memberSpaces && updatedSpace.name) {
          state.memberSpaces = state.memberSpaces.map((space) =>
            space.spaceId === updatedSpace.id
              ? { ...space, spaceName: updatedSpace.name }
              : space
          );
        }
      },
    }),

    deleteContentFromSpace: create.asyncThunk(deleteContentFromSpaceAction, {
      fulfilled: (state, action) => {
        const { spaceId, updatedSpaceData } = action.payload;
        if (spaceId === state.currentSpaceId) {
          state.currentSpace = updatedSpaceData;
        }
      },
    }),

    loadDefaultSpace: create.asyncThunk(loadDefaultSpaceAction, {
      pending: (state) => {
        state.loading = true;
        state.initialized = false;
        state.error = undefined;
      },
      // fulfilled 和 rejected 由内部 dispatch 的 changeSpace 处理状态更新
      // 这里仅更新 loading 和 initialized 状态
      fulfilled: (state) => {
        state.loading = false;
        // initialized 由 changeSpace.fulfilled 或 changeSpace.rejected 更新
        // 如果 loadDefaultSpace 内部没有找到或未能切换到 space，状态可能保持 loading=false, initialized=true, currentSpaceId=null
        if (!state.currentSpaceId) {
          // 确保在没有成功切换时重置
          state.initialized = true; // 标记为初始化尝试完成
          state.collapsedCategories = {};
        }
      },
      rejected: (state, action) => {
        state.loading = false;
        state.initialized = true; // 即使失败也标记为已初始化
        state.error = action.error.message || "Failed to load default space";
        state.currentSpaceId = null; // 清空
        state.currentSpace = null;
        state.collapsedCategories = {}; // 重置
      },
    }),

    addMember: create.asyncThunk(addMemberAction, {
      fulfilled: (state, action) => {
        if (state.currentSpaceId === action.payload.spaceId) {
          state.currentSpace = action.payload.updatedSpaceData;
        }
      },
    }),

    removeMember: create.asyncThunk(removeMemberAction, {
      fulfilled: (state, action) => {
        if (state.currentSpaceId === action.payload.spaceId) {
          state.currentSpace = action.payload.updatedSpaceData;
        }
      },
    }),

    // --- Category Related Actions ---

    addCategory: create.asyncThunk(addCategoryAction, {
      fulfilled: (state, action) => {
        if (state.currentSpaceId === action.payload.spaceId) {
          state.currentSpace = action.payload.updatedSpaceData;
          // 新添加的分类默认展开，无需操作 collapsedCategories
        }
      },
    }),

    deleteCategory: create.asyncThunk(deleteCategoryAction, {
      fulfilled: (state, action) => {
        const { spaceId, categoryId } = action.meta.arg; // 从 meta 获取参数
        if (state.currentSpaceId === spaceId) {
          state.currentSpace = action.payload.updatedSpaceData;
          // 删除对应的折叠状态
          if (state.collapsedCategories[categoryId] !== undefined) {
            const newCollapsed = { ...state.collapsedCategories };
            delete newCollapsed[categoryId];
            state.collapsedCategories = newCollapsed;
          }
        }
      },
    }),

    updateCategoryName: create.asyncThunk(updateCategoryNameAction, {
      fulfilled: (state, action) => {
        if (state.currentSpaceId === action.payload.spaceId) {
          state.currentSpace = action.payload.updatedSpaceData;
        }
      },
    }),

    updateContentCategory: create.asyncThunk(updateContentCategoryAction, {
      fulfilled: (state, action) => {
        if (state.currentSpaceId === action.payload.spaceId) {
          state.currentSpace = action.payload.updatedSpaceData;
        }
      },
    }),

    reorderCategories: create.asyncThunk(reorderCategoriesAction, {
      fulfilled: (state, action) => {
        if (state.currentSpaceId === action.payload.spaceId) {
          state.currentSpace = action.payload.updatedSpaceData;
        }
      },
    }),

    fetchSpace: create.asyncThunk(fetchSpaceAction, {
      // fetchSpace 应该类似于 changeSpace，会更新 currentSpace
      // 并且也应该重置 collapsedCategories
      fulfilled: (state, action) => {
        const { spaceId, spaceData } = action.payload;
        if (state.currentSpaceId === spaceId) {
          state.currentSpace = spaceData;
          // 重置折叠状态，因为 space 数据可能完全变了
          state.collapsedCategories = {};
        }
      },
      // 考虑添加 pending 和 rejected
    }),

    updateContentTitle: create.asyncThunk(updateContentTitleAction, {
      fulfilled: (state, action) => {
        if (state.currentSpaceId === action.payload.spaceId) {
          state.currentSpace = action.payload.updatedSpaceData;
        }
      },
    }),
  }), // end reducers
}); // end createSliceWithThunks

// 导出 Actions
export const {
  changeSpace,
  addSpace,
  deleteSpace,
  updateSpace,
  addContentToSpace,
  deleteContentFromSpace,
  loadDefaultSpace,
  fetchUserSpaceMemberships,
  addMember,
  removeMember,
  addCategory,
  deleteCategory,
  updateCategoryName,
  updateContentCategory,
  reorderCategories,
  fetchSpace,
  updateContentTitle,
  moveContentToSpace,
  // 导出新 action
  toggleCategoryCollapse,
} = spaceSlice.actions;

// Selectors
const selectSpaceState = (state: NoloRootState) => state.space;

export const selectCurrentSpaceId = createSelector(
  selectSpaceState,
  (space) => space.currentSpaceId
);

export const selectCurrentSpace = createSelector(
  selectSpaceState,
  (space) => space.currentSpace
);

export const selectAllMemberSpaces = createSelector(
  selectSpaceState,
  (space) => space.memberSpaces || []
);

export const selectOwnedMemberSpaces = createSelector(
  selectAllMemberSpaces, // 基于上一个 selector
  (memberSpaces) =>
    memberSpaces.filter((space) => space.role === MemberRole.OWNER)
);

export const selectSpaceLoading = createSelector(
  selectSpaceState,
  (space) => space.loading
);

export const selectSpaceInitialized = createSelector(
  selectSpaceState,
  (space) => space.initialized
);

// 新增 Selector
export const selectCollapsedCategories = createSelector(
  selectSpaceState,
  (space) => space.collapsedCategories
);

// 动态 Selector 工厂：根据 categoryId 获取折叠状态
// 注意：这种方式每次调用都会创建一个新的 selector 实例，
// 如果在组件中频繁使用，可能会影响性能优化 (memoization)。
// 对于这种情况，直接在组件中使用 selectCollapsedCategories 并访问 [categoryId] 可能更简单。
// 或者，如果性能确实是问题，考虑使用 reselect 的参数化 selector 功能。
export const selectIsCategoryCollapsed = (categoryId: string) =>
  createSelector(
    selectCollapsedCategories,
    (collapsed) => collapsed[categoryId] ?? false
  );

// 导出 Reducer
export default spaceSlice.reducer;
