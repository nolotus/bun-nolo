import type { RootState } from "app/store";
import {
  asyncThunkCreator,
  buildCreateSlice,
  createSelector,
} from "@reduxjs/toolkit";
import { SpaceMemberWithSpaceInfo } from "app/types";
import { MemberRole } from "app/types";
import { SpaceData } from "app/types";

import { createCategoryActions } from "./category/categoryActions";
import { createContentThunks } from "./content/contentThunks";
import { createMemberThunks } from "./member/memberThunks";
import { createSpaceThunks } from "./spaceThunks";

export interface CreateSpaceRequest {}

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

export interface SpaceState {
  currentSpaceId: string | null;
  currentSpace: SpaceData | null;
  memberSpaces: SpaceMemberWithSpaceInfo[] | null;
  loading: boolean;
  error?: string;
  initialized: boolean;
  collapsedCategories: Record<string, boolean>;
}

const initialState: SpaceState = {
  currentSpaceId: null,
  currentSpace: null,
  memberSpaces: null,
  loading: false,
  initialized: false,
  collapsedCategories: {},
};

const spaceSlice = createSliceWithThunks({
  name: "space",
  initialState,
  reducers: (create) => ({
    ...createSpaceThunks(create),
    ...createCategoryActions(create), // 单一函数调用，更清晰
    ...createContentThunks(create),
    ...createMemberThunks(create),
  }),
});

export const {
  toggleCategoryCollapse,
  setAllCategoriesCollapsed,
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
  deleteMultipleContent,
  updateContentTitle,
  updateContentCategory,
  fetchUserSpaceMemberships,
  addMember,
  removeMember,
  fixSpace,
} = spaceSlice.actions;

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
  (space) => {
    const memberSpaces = space.memberSpaces || [];
    return [...memberSpaces].sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }
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

export default spaceSlice.reducer;
