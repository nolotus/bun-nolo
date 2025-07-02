// store/space/actions/categoryActions.ts

import { asyncThunkCreator, type PayloadAction } from "@reduxjs/toolkit";
import { ulid } from "ulid";
import type { AppDispatch, RootState } from "app/store";
import type { Category, SpaceContent, SpaceData, ULID } from "app/types";
import { selectUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { patch, read } from "database/dbSlice";
import { UNCATEGORIZED_ID } from "../constants";
import { selectCurrentSpaceId } from "../spaceSlice";
import type { SpaceState } from "../spaceSlice";
import { checkSpaceMembership } from "../utils/permissions";

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
  addCategory: create.asyncThunk(
    async (
      input: {
        spaceId?: string;
        name: string;
        categoryId?: string;
        order?: number;
      },
      thunkAPI: { dispatch: AppDispatch; getState: () => RootState }
    ): Promise<{ spaceId: ULID; updatedSpaceData: SpaceData }> => {
      const { spaceId: inputSpaceId, name, categoryId, order } = input;
      const { dispatch, getState } = thunkAPI;
      const state = getState();

      const spaceId = inputSpaceId || selectCurrentSpaceId(state);
      if (!spaceId) {
        throw new Error("无法添加分类：未选择当前空间且未提供空间 ID。");
      }
      const currentUserId = selectUserId(state);
      if (!currentUserId) throw new Error("User is not logged in.");

      if (!name || typeof name !== "string" || name.trim() === "") {
        throw new Error("无效的分类名称。");
      }

      const spaceKey = createSpaceKey.space(spaceId);
      const spaceData: SpaceData = await dispatch(read(spaceKey)).unwrap();
      checkSpaceMembership(spaceData, currentUserId);

      const newCategoryId = categoryId || ulid();
      if (spaceData.categories?.[newCategoryId]) {
        throw new Error(`分类 ID "${newCategoryId}" 已存在。`);
      }

      const existingValidCategories = spaceData.categories
        ? Object.values(spaceData.categories).filter(Boolean)
        : [];
      const finalOrder =
        order !== undefined && typeof order === "number"
          ? order
          : existingValidCategories.length;

      const nowISO = new Date().toISOString();
      const newCategory: Category = {
        name: name.trim(),
        order: finalOrder,
        updatedAt: nowISO,
      };

      const updatedSpaceData = await dispatch(
        patch({
          dbKey: spaceKey,
          changes: {
            categories: { [newCategoryId]: newCategory },
            updatedAt: nowISO,
          },
        })
      ).unwrap();

      return { spaceId, updatedSpaceData };
    },
    {
      fulfilled: (state, action) => {
        if (state.currentSpaceId === action.payload.spaceId) {
          state.currentSpace = action.payload.updatedSpaceData;
        }
      },
    }
  ),

  deleteCategory: create.asyncThunk(
    async (
      input: { categoryId: string; spaceId: ULID },
      thunkAPI: { dispatch: AppDispatch; getState: () => RootState }
    ): Promise<{ spaceId: ULID; updatedSpaceData: SpaceData }> => {
      const { categoryId, spaceId } = input;
      const { dispatch, getState } = thunkAPI;
      const currentUserId = selectUserId(getState());

      if (!currentUserId) throw new Error("User is not logged in.");
      if (!categoryId || typeof categoryId !== "string" || !categoryId.trim())
        throw new Error("无效的 categoryId。");

      const spaceKey = createSpaceKey.space(spaceId);
      const spaceData: SpaceData = await dispatch(read(spaceKey)).unwrap();
      checkSpaceMembership(spaceData, currentUserId);

      if (!spaceData?.categories?.[categoryId]) {
        throw new Error("指定的分类不存在或已被删除。");
      }

      const nowISO = new Date().toISOString();
      const changes: Partial<
        Pick<SpaceData, "categories" | "contents" | "updatedAt">
      > = {
        categories: { [categoryId]: null },
        updatedAt: nowISO,
      };

      if (spaceData.contents) {
        const contentsPatch: Record<string, Partial<SpaceContent> | null> = {};
        let contentsChanged = false;
        for (const key in spaceData.contents) {
          if (spaceData.contents[key]?.categoryId === categoryId) {
            contentsPatch[key] = { categoryId: null, updatedAt: nowISO };
            contentsChanged = true;
          }
        }
        if (contentsChanged) changes.contents = contentsPatch;
      }

      const updatedSpaceData = await dispatch(
        patch({ dbKey: spaceKey, changes })
      ).unwrap();

      return { spaceId, updatedSpaceData };
    },
    {
      fulfilled: (state, action) => {
        const { categoryId } = action.meta.arg;
        if (state.currentSpaceId === action.payload.spaceId) {
          state.currentSpace = action.payload.updatedSpaceData;
          if (state.collapsedCategories[categoryId] !== undefined) {
            delete state.collapsedCategories[categoryId];
          }
        }
      },
    }
  ),

  updateCategoryName: create.asyncThunk(
    async (
      input: { spaceId: ULID; categoryId: string; name: string },
      thunkAPI: { dispatch: AppDispatch; getState: () => RootState }
    ): Promise<{ spaceId: ULID; updatedSpaceData: SpaceData }> => {
      const { spaceId, categoryId, name } = input;
      const { dispatch, getState } = thunkAPI;
      const currentUserId = selectUserId(getState());

      if (!currentUserId) throw new Error("User is not logged in.");
      if (!categoryId || typeof categoryId !== "string" || !categoryId.trim()) {
        throw new Error("无效的 categoryId。");
      }
      const trimmedName = (name || "").trim();
      if (!trimmedName) {
        throw new Error("分类名称不能为空或仅包含空格。");
      }

      const spaceKey = createSpaceKey.space(spaceId);
      const spaceData: SpaceData = await dispatch(read(spaceKey)).unwrap();
      checkSpaceMembership(spaceData, currentUserId);

      const existingCategory = spaceData.categories?.[categoryId];
      if (!existingCategory) {
        throw new Error("指定的分类不存在。");
      }

      const nowISO = new Date().toISOString();
      const changes = {
        categories: {
          [categoryId]: {
            ...existingCategory,
            name: trimmedName,
            updatedAt: nowISO,
          },
        },
        updatedAt: nowISO,
      };

      const updatedSpaceData = await dispatch(
        patch({ dbKey: spaceKey, changes })
      ).unwrap();

      return { spaceId, updatedSpaceData };
    },
    {
      fulfilled: (state, action) => {
        if (state.currentSpaceId === action.payload.spaceId) {
          state.currentSpace = action.payload.updatedSpaceData;
        }
      },
    }
  ),

  reorderCategories: create.asyncThunk(
    async (
      input: { spaceId: ULID; sortedCategoryIds: string[] },
      thunkAPI: { dispatch: AppDispatch; getState: () => RootState }
    ): Promise<{ spaceId: ULID; updatedSpaceData: SpaceData }> => {
      const { spaceId, sortedCategoryIds } = input;
      const { dispatch, getState } = thunkAPI;
      const state = getState();
      const currentUserId = selectUserId(state);

      if (!currentUserId) {
        throw new Error("User is not logged in.");
      }
      if (!Array.isArray(sortedCategoryIds)) {
        throw new Error(
          "Invalid sortedCategoryIds provided: must be an array."
        );
      }

      const spaceKey = createSpaceKey.space(spaceId);
      const spaceData: SpaceData = await dispatch(read(spaceKey)).unwrap();

      checkSpaceMembership(spaceData, currentUserId);

      if (
        !spaceData.categories ||
        Object.keys(spaceData.categories).length === 0
      ) {
        return { spaceId, updatedSpaceData: spaceData };
      }

      const nowISO = new Date().toISOString();
      const currentCategories = spaceData.categories;
      const updatedCategoriesChanges: Record<string, Category | null> = {};
      let hasValidChanges = false;

      sortedCategoryIds.forEach((catId, index) => {
        const existingCategory = currentCategories[catId];
        if (existingCategory) {
          updatedCategoriesChanges[catId] = {
            ...existingCategory,
            order: index,
            updatedAt: nowISO,
          };
          if (existingCategory.order !== index) {
            hasValidChanges = true;
          }
        }
      });

      // 如果排序列表和现有分类不完全匹配，也认为有变更（例如仅更新时间戳）
      if (
        !hasValidChanges &&
        Object.keys(updatedCategoriesChanges).length > 0
      ) {
        hasValidChanges = true;
      }

      if (!hasValidChanges) {
        return { spaceId, updatedSpaceData: spaceData };
      }

      const changes = {
        categories: updatedCategoriesChanges,
        updatedAt: nowISO,
      };

      const updatedSpaceData = await dispatch(
        patch({ dbKey: spaceKey, changes })
      ).unwrap();

      return { spaceId, updatedSpaceData };
    },
    {
      fulfilled: (state, action) => {
        if (state.currentSpaceId === action.payload.spaceId) {
          state.currentSpace = action.payload.updatedSpaceData;
        }
      },
    }
  ),
});
