// create/space/spaceSlice.ts
import type { RootState } from "app/store"; // Adjust path if needed
import {
  type PayloadAction,
  asyncThunkCreator,
  buildCreateSlice,
  createSelector,
} from "@reduxjs/toolkit";
import { SpaceData, MemberRole, SpaceMemberWithSpaceInfo } from "./types"; // Import types from current directory

// --- Import Thunk creators from their new locations ---
import { createCategoryThunks } from "./category/categoryThunks";
import { createContentThunks } from "./content/contentThunks";
import { createMemberThunks } from "./member/memberThunks";
import { createSpaceThunks } from "./spaceThunks"; // Import core space thunks

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

// 定义 State 结构 (导出以供 thunk 文件使用)
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

    // --- 合并异步 Thunks from different domains ---
    ...createSpaceThunks(create), // Core space operations + changeSpace
    ...createCategoryThunks(create), // Category operations
    ...createContentThunks(create), // Content operations
    ...createMemberThunks(create), // Member operations
  }), // end reducers
}); // end createSliceWithThunks

// 导出 Actions (RTK automatically generates action creators for all reducers and thunks)
export const {
  // Sync
  toggleCategoryCollapse,
  // Async (Names remain the same as defined in the thunks)
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

// Selectors (Keep them here or move to a separate selectors file if preferred)
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
