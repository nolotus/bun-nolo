// src/create/space/category/categoryThunks.ts
import { asyncThunkCreator } from "@reduxjs/toolkit";
import type { SpaceState } from "../spaceSlice"; // Adjust path
import type { SpaceData } from "../types"; // Adjust path
import { addCategoryAction } from "./addCategoryAction";
import { deleteCategoryAction } from "./deleteCategoryAction";
import { updateCategoryNameAction } from "./updateCategoryNameAction";
import { reorderCategoriesAction } from "./reorderCategoriesAction";

// Define create 参数的类型 (根据 buildCreateSlice 的 API)
type Create = ReturnType<
  typeof asyncThunkCreator<SpaceState> // 使用 SpaceState 约束 State 类型
>;

/**
 * 创建与分类相关的 Async Thunks
 * @param create - 由 buildCreateSlice 提供的创建器对象
 */
export const createCategoryThunks = (create: Create) => ({
  addCategory: create.asyncThunk(addCategoryAction, {
    fulfilled: (state, action) => {
      if (state.currentSpaceId === action.payload.spaceId) {
        state.currentSpace = action.payload.updatedSpaceData;
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
