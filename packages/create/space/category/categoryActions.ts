// store/space/actions/categoryActions.ts

import { asyncThunkCreator, type PayloadAction } from "@reduxjs/toolkit";
import { ulid } from "ulid";
import type { AppDispatch, RootState } from "app/store";
import type { Category, SpaceContent, SpaceData, ULID } from "app/types";
import { selectUserId } from "auth/authSlice";
import { createSpaceKey } from "create/space/spaceKeys";
import { patch, read, upsert } from "database/dbSlice";
import { UNCATEGORIZED_ID } from "../constants";
import { selectCurrentSpaceId } from "../spaceSlice";
import type { SpaceState } from "../spaceSlice";
import { checkSpaceMembership } from "../utils/permissions";
import { DataType } from "../../types";

type Create = ReturnType<typeof asyncThunkCreator<SpaceState>>;

/**
 * 创建与分类（Category）相关的所有 Reducer 和 Async Thunks
 * @param create - 由 buildCreateSlice 提供的创建器对象
 */
export const createCategoryActions = (create: Create) => ({
  // --- Regular Reducers ---

  /**
   * (新增) 从持久化存储中水合分类的折叠状态
   */
  hydrateCollapsedCategories: create.reducer(
    (state: SpaceState, action: PayloadAction<Record<string, boolean>>) => {
      state.collapsedCategories = action.payload || {};
    }
  ),

  // --- Async Thunks ---

  /**
   * 批量切换所有分类的折叠状态，并持久化到数据库
   */
  setAllCategoriesCollapsed: create.asyncThunk(
    async (
      input: { spaceId?: string; collapsed: boolean },
      thunkAPI: { dispatch: AppDispatch; getState: () => RootState }
    ): Promise<Record<string, boolean>> => {
      const { dispatch, getState } = thunkAPI;
      const rootState = getState();

      // 验证用户登录
      const currentUserId = selectUserId(rootState);
      if (!currentUserId) throw new Error("用户未登录，无法保存设置。");

      // 优先使用传入的 spaceId，否则获取当前活动空间
      const spaceId = input.spaceId || selectCurrentSpaceId(rootState);
      if (!spaceId) throw new Error("无法切换折叠状态：没有活动的空间。");

      // 获取当前空间的所有分类 ID（包括已删除标签以外的所有分类）
      const { currentSpace } = rootState.space;
      const categoryIds = currentSpace?.categories
        ? Object.keys(currentSpace.categories)
        : [];
      // 始终包含“未分类”
      categoryIds.push(UNCATEGORIZED_ID);

      // 构造新的折叠状态映射
      const collapsedCategories: Record<string, boolean> = {};
      categoryIds.forEach((id) => {
        collapsedCategories[id] = input.collapsed;
      });

      // 持久化 key
      const settingKey = createSpaceKey.setting(currentUserId, spaceId);
      // 构造深度合并的数据，仅更新 collapsedCategories
      const changes = {
        type: DataType.SETTING,
        collapsedCategories,
      };
      // 调用 upsert 进行数据持久化和同步
      const updatedSettings = await dispatch(
        upsert({ dbKey: settingKey, data: changes })
      ).unwrap();

      // 返回后端最新的 collapsedCategories，用于更新 Redux state
      return updatedSettings.collapsedCategories as Record<string, boolean>;
    },
    {
      fulfilled: (state, action) => {
        // 合并返回的折叠状态，保持与持久化一致
        state.collapsedCategories = {
          ...state.collapsedCategories,
          ...action.payload,
        };
      },
      rejected: (state, action) => {
        console.error("批量切换分类折叠状态失败:", action.error.message);
      },
    }
  ),

  /**
   * 切换单个分类的折叠状态，并持久化存储。
   * 直接使用当前激活的 spaceId，无需外部传入。
   */
  toggleCategoryCollapse: create.asyncThunk(
    async (
      input: { categoryId: string },
      thunkAPI: { dispatch: AppDispatch; getState: () => RootState }
    ): Promise<Record<string, boolean>> => {
      const { dispatch, getState } = thunkAPI;
      const { categoryId } = input;
      const rootState = getState();

      // 验证用户登录
      const currentUserId = selectUserId(rootState);
      if (!currentUserId) throw new Error("用户未登录，无法保存设置。");

      // 获取当前空间 ID
      const spaceId = selectCurrentSpaceId(rootState);
      if (!spaceId) throw new Error("无法切换折叠状态：没有活动的空间。");
      if (!categoryId) throw new Error("无效的分类ID。");

      // 计算新的折叠状态
      const isCurrentlyCollapsed =
        rootState.space.collapsedCategories[categoryId] ?? false;
      const newCollapsedState = !isCurrentlyCollapsed;

      // 持久化 key
      const settingKey = createSpaceKey.setting(currentUserId, spaceId);
      // 构造深度合并的数据，仅更新单个分类的折叠状态
      const changes = {
        type: DataType.SETTING,
        collapsedCategories: {
          [categoryId]: newCollapsedState,
        },
      };
      // 调用 upsert 进行数据持久化和同步
      const updatedSettings = await dispatch(
        upsert({ dbKey: settingKey, data: changes })
      ).unwrap();

      // 返回后端最新的 collapsedCategories，用于更新 Redux state
      return updatedSettings.collapsedCategories as Record<string, boolean>;
    },
    {
      fulfilled: (state, action) => {
        state.collapsedCategories = {
          ...state.collapsedCategories,
          ...action.payload,
        };
      },
      rejected: (state, action) => {
        console.error("切换分类折叠状态失败:", action.error.message);
      },
    }
  ),

  /**
   * 添加新分类
   */
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
      const rootState = getState();

      const spaceId = inputSpaceId || selectCurrentSpaceId(rootState);
      if (!spaceId) {
        throw new Error("无法添加分类：未选择当前空间且未提供空间 ID。");
      }
      const currentUserId = selectUserId(rootState);
      if (!currentUserId) throw new Error("User is not logged in.");

      if (!name.trim()) {
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
        typeof order === "number" ? order : existingValidCategories.length;

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

  /**
   * 删除单个分类
   */
  deleteCategory: create.asyncThunk(
    async (
      input: { categoryId: string; spaceId: ULID },
      thunkAPI: { dispatch: AppDispatch; getState: () => RootState }
    ): Promise<{ spaceId: ULID; updatedSpaceData: SpaceData }> => {
      const { categoryId, spaceId } = input;
      const { dispatch, getState } = thunkAPI;
      const currentUserId = selectUserId(getState());

      if (!currentUserId) throw new Error("User is not logged in.");
      if (!categoryId.trim()) throw new Error("无效的 categoryId。");

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
            contentsPatch[key] = {
              categoryId: null,
              updatedAt: nowISO,
            };
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
          // 删除已删除分类的折叠状态
          if (state.collapsedCategories[categoryId] !== undefined) {
            delete state.collapsedCategories[categoryId];
          }
        }
      },
    }
  ),

  /**
   * 修改分类名称
   */
  updateCategoryName: create.asyncThunk(
    async (
      input: { spaceId: ULID; categoryId: string; name: string },
      thunkAPI: { dispatch: AppDispatch; getState: () => RootState }
    ): Promise<{ spaceId: ULID; updatedSpaceData: SpaceData }> => {
      const { spaceId, categoryId, name } = input;
      const { dispatch, getState } = thunkAPI;
      const currentUserId = selectUserId(getState());

      if (!currentUserId) throw new Error("User is not logged in.");
      if (!categoryId.trim()) throw new Error("无效的 categoryId。");
      const trimmedName = name.trim();
      if (!trimmedName) throw new Error("分类名称不能为空或仅包含空格。");

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

  /**
   * 重新排序分类
   */
  reorderCategories: create.asyncThunk(
    async (
      input: { spaceId: ULID; sortedCategoryIds: string[] },
      thunkAPI: { dispatch: AppDispatch; getState: () => RootState }
    ): Promise<{ spaceId: ULID; updatedSpaceData: SpaceData }> => {
      const { spaceId, sortedCategoryIds } = input;
      const { dispatch, getState } = thunkAPI;
      const stateRoot = getState();

      const currentUserId = selectUserId(stateRoot);
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
