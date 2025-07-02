import { asyncThunkCreator, type PayloadAction } from "@reduxjs/toolkit";
import type { SpaceState } from "../spaceSlice";
import { UNCATEGORIZED_ID } from "../constants";
import { addCategoryAction } from "./addCategoryAction";
import { deleteCategoryAction } from "./deleteCategoryAction";
import { updateCategoryNameAction } from "./updateCategoryNameAction";
import { reorderCategoriesAction } from "./reorderCategoriesAction";

type Create = ReturnType<typeof asyncThunkCreator<SpaceState>>;

/**
 * 创建与分类（Category）相关的所有 Reducer 和 Async Thunks
 * @param create - 由 buildCreateSlice 提供的创建器对象
 */
export const createCategoryActions = (create: Create) => ({
  // --- Regular Reducers ---
  toggleCategoryCollapse: create.reducer(
    (state: SpaceState, action: PayloadAction<string>) => {
      const categoryId = action.payload;
      if (categoryId) {
        const currentCollapsed = state.collapsedCategories[categoryId] ?? false;
        state.collapsedCategories[categoryId] = !currentCollapsed;
      }
    }
  ),

  setAllCategoriesCollapsed: create.reducer(
    (
      state: SpaceState,
      action: PayloadAction<{ spaceId: string; collapsed: boolean }>
    ) => {
      const { collapsed } = action.payload;
      const currentSpace = state.currentSpace;

      if (currentSpace?.categories) {
        const categoryIds = Object.keys(currentSpace.categories);
        categoryIds.forEach((catId) => {
          state.collapsedCategories[catId] = collapsed;
        });
        state.collapsedCategories[UNCATEGORIZED_ID] = collapsed;
      }
    }
  ),

  // --- Async Thunks ---
  addCategory: create.asyncThunk(addCategoryAction, {
    fulfilled: (state, action) => {
      if (state.currentSpaceId === action.payload.spaceId) {
        state.currentSpace = action.payload.updatedSpaceData;
      }
    },
  }),

  deleteCategory: create.asyncThunk(deleteCategoryAction, {
    fulfilled: (state, action) => {
      const { spaceId, categoryId } = action.meta.arg;
      if (state.currentSpaceId === spaceId) {
        state.currentSpace = action.payload.updatedSpaceData;
        if (state.collapsedCategories[categoryId] !== undefined) {
          delete state.collapsedCategories[categoryId];
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

  reorderCategories: create.asyncThunk(reorderCategoriesAction, {
    fulfilled: (state, action) => {
      if (state.currentSpaceId === action.payload.spaceId) {
        state.currentSpace = action.payload.updatedSpaceData;
      }
    },
  }),
});
