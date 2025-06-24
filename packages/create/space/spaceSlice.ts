// 文件路径: create/space/spaceSlice.ts
import type { RootState } from "app/store";
import {
  type PayloadAction,
  asyncThunkCreator,
  buildCreateSlice,
  createSelector,
} from "@reduxjs/toolkit";
import { SpaceData, MemberRole, SpaceMemberWithSpaceInfo } from "./types";
import { UNCATEGORIZED_ID } from "./constants"; // <-- 确保导入

// --- Import Thunk creators from their new locations ---
import { createCategoryThunks } from "./category/categoryThunks";
import { createContentThunks } from "./content/contentThunks";
import { createMemberThunks } from "./member/memberThunks";
import { createSpaceThunks } from "./spaceThunks";

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

// 定义 State 结构
export interface SpaceState {
  currentSpaceId: string | null;
  currentSpace: SpaceData | null;
  memberSpaces: SpaceMemberWithSpaceInfo[] | null;
  loading: boolean;
  error?: string;
  initialized: boolean;
  collapsedCategories: Record<string, boolean>;
}

// 初始 State
const initialState: SpaceState = {
  currentSpaceId: null,
  currentSpace: null,
  memberSpaces: null,
  loading: false,
  initialized: false,
  collapsedCategories: {},
};

// 创建 Slice
const spaceSlice = createSliceWithThunks({
  name: "space",
  initialState,
  reducers: (create) => ({
    // --- 同步 Reducers ---
    toggleCategoryCollapse: create.reducer(
      (state, action: PayloadAction<string>) => {
        const categoryId = action.payload;
        if (categoryId) {
          const currentCollapsed =
            state.collapsedCategories[categoryId] ?? false;
          state.collapsedCategories[categoryId] = !currentCollapsed;
        }
      }
    ),

    // <-- 修改此 Reducer -->
    setAllCategoriesCollapsed: create.reducer(
      (
        state,
        action: PayloadAction<{ spaceId: string; collapsed: boolean }>
      ) => {
        const { collapsed } = action.payload;
        const currentSpace = state.currentSpace;

        if (currentSpace && currentSpace.categories) {
          const categoryIds = Object.keys(currentSpace.categories);

          // 1. 设置所有命名分类的折叠状态
          categoryIds.forEach((catId) => {
            state.collapsedCategories[catId] = collapsed;
          });

          // 2. 同时设置"未分类"区域的折叠状态
          state.collapsedCategories[UNCATEGORIZED_ID] = collapsed;
        }
      }
    ),

    // --- 合并异步 Thunks from different domains ---
    ...createSpaceThunks(create),
    ...createCategoryThunks(create),
    ...createContentThunks(create),
    ...createMemberThunks(create),
  }),
});

// 导出 Actions
export const {
  // Sync
  toggleCategoryCollapse,
  setAllCategoriesCollapsed,
  // Async
  changeSpace,
  addSpace,
  deleteSpace,
  updateSpace,
  loadDefaultSpace,
  fetchSpace,
  addCategory,
  deleteCategory,
  updateCategoryName,
  reorderCategories,
  addContentToSpace,
  moveContentToSpace,
  deleteContentFromSpace,
  updateContentTitle,
  updateContentCategory,
  fetchUserSpaceMemberships,
  addMember,
  removeMember,
  fixSpace,
} = spaceSlice.actions;

// Selectors
const selectSpaceState = (state: RootState) => state.space;

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
  selectAllMemberSpaces,
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

export const selectCollapsedCategories = createSelector(
  selectSpaceState,
  (space) => space.collapsedCategories
);

export const selectIsCategoryCollapsed = (categoryId: string) =>
  createSelector(
    selectCollapsedCategories,
    (collapsed) => collapsed[categoryId] ?? false
  );

// 导出 Reducer
export default spaceSlice.reducer;
