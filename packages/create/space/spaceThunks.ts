// create/space/spaceThunks.ts
import { asyncThunkCreator } from "@reduxjs/toolkit";
import type { RootState } from "app/store";
import type { SpaceData, SpaceSetting } from "app/types";
import { selectUserId } from "auth/authSlice";
import { patch, read } from "database/dbSlice";
import { addSpaceAction } from "./addSpaceAction";
import { deleteSpaceAction } from "./deleteSpaceAction";
import { fetchSpaceAction } from "./fetchSpaceAction";
import { loadDefaultSpaceAction } from "./loadDefaultSpaceAction";
import { createSpaceKey } from "./spaceKeys";
import { type SpaceState, fetchSpaceSettings } from "./spaceSlice";
import { updateSpaceAction } from "./updateSpaceAction";

type Create = ReturnType<typeof asyncThunkCreator<SpaceState>>;

/**
 * 创建与 Space 操作相关的 Async Thunks
 * @param create - 由 buildCreateSlice 提供的创建器对象
 */
export const createSpaceThunks = (create: Create) => ({
  // --- 获取用户特定空间设置 ---
  fetchSpaceSettings: create.asyncThunk(
    async (spaceId: string, thunkAPI) => {
      const { dispatch, getState } = thunkAPI;
      const state = getState() as RootState;
      const userId = selectUserId(state);

      if (!userId) {
        // 如果没有用户ID，直接返回默认值，不抛出错误
        return { collapsedCategories: {} };
      }

      const settingKey = createSpaceKey.setting(userId, spaceId);
      console.log("获取空间设置:", settingKey);
      const settingsData = await dispatch(read(settingKey)).unwrap();
      // 如果没有设置数据或数据中没有 collapsedCategories，返回空对象
      return {
        collapsedCategories: settingsData?.collapsedCategories || {},
      };
    },
    {
      fulfilled: (state, action) => {
        state.collapsedCategories = action.payload.collapsedCategories;
      },
      rejected: (state, action) => {
        // 如果获取设置失败，打印错误并重置为默认状态
        console.error("获取空间设置失败:", action.error.message);
        state.collapsedCategories = {};
      },
    }
  ),

  // --- 切换空间 (核心操作) ---
  changeSpace: create.asyncThunk(
    async (spaceId: string, thunkAPI) => {
      const { dispatch } = thunkAPI;

      // 1. 获取核心空间数据
      const spaceKey = createSpaceKey.space(spaceId);
      const spaceData = (await dispatch(
        read(spaceKey)
      ).unwrap()) as SpaceData | null;
      if (!spaceData) {
        throw new Error("空间不存在或加载失败");
      }

      // 2. 异步获取该空间的用户特定设置 (非阻塞)
      try {
        await dispatch(fetchSpaceSettings(spaceId)).unwrap();
      } catch (error) {
        // 关键: 即使设置加载失败，也不影响主流程，仅记录警告
        console.warn("获取空间设置失败，但不影响空间切换:", error);
      }

      // 3. 返回空间数据 payload
      return { spaceId, spaceData };
    },
    {
      pending: (state) => {
        state.loading = true;
        state.error = undefined;
      },
      fulfilled: (state, action) => {
        state.currentSpaceId = action.payload.spaceId;
        state.currentSpace = action.payload.spaceData;
        // 注意: collapsedCategories 由 fetchSpaceSettings.fulfilled 独立更新
        state.initialized = true;
        state.loading = false;
      },
      rejected: (state, action) => {
        state.error = action.error.message || "切换空间失败";
        state.initialized = true;
        state.loading = false;
        state.currentSpaceId = null;
        state.currentSpace = null;
        state.collapsedCategories = {}; // 主流程失败时，也重置设置
      },
    }
  ),

  // --- 其他核心空间操作 ---
  addSpace: create.asyncThunk(addSpaceAction, {
    fulfilled: (state, action) => {
      if (state.memberSpaces) {
        state.memberSpaces.push(action.payload);
      } else {
        state.memberSpaces = [action.payload];
      }
    },
    pending: (state) => {
      state.loading = true;
    },
    rejected: (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    },
  }),

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
        state.collapsedCategories = {};
      }
    },
  }),

  updateSpace: create.asyncThunk(updateSpaceAction, {
    fulfilled: (state, action) => {
      const { updatedSpace, spaceId } = action.payload;
      if (spaceId === state.currentSpaceId) {
        state.currentSpace = updatedSpace;
      }
      if (state.memberSpaces && updatedSpace.name) {
        state.memberSpaces = state.memberSpaces.map((space) =>
          space.spaceId === updatedSpace.id
            ? { ...space, spaceName: updatedSpace.name }
            : space
        );
      }
    },
  }),

  loadDefaultSpace: create.asyncThunk(loadDefaultSpaceAction, {
    pending: (state) => {
      state.loading = true;
      state.initialized = false;
      state.error = undefined;
    },
    fulfilled: (state) => {
      state.loading = false;
      // 实际状态更新由内部派发的 changeSpace Thunk 处理
      if (!state.currentSpaceId) {
        state.initialized = true;
        state.collapsedCategories = {};
      }
    },
    rejected: (state, action) => {
      state.loading = false;
      state.initialized = true;
      state.error = action.error.message || "加载默认空间失败";
      state.currentSpaceId = null;
      state.currentSpace = null;
      state.collapsedCategories = {};
    },
  }),

  fetchSpace: create.asyncThunk(fetchSpaceAction, {
    fulfilled: (state, action) => {
      const { spaceId, spaceData } = action.payload;
      // 假设 fetchSpace 只是后台刷新当前空间数据
      if (state.currentSpaceId === spaceId) {
        state.currentSpace = spaceData;
        // 刷新数据时不应重置用户交互状态，故此处不修改 collapsedCategories
      }
    },
  }),

  fixSpace: create.asyncThunk(async (spaceId, thunkAPI) => {
    const currentSpace = (thunkAPI.getState() as RootState).space.currentSpace;
    const spaceIdError = spaceId.startsWith("space-");
    // 增加对 currentSpace 是否存在的检查，防止运行时错误
    const currentSpaceError = currentSpace?.id.startsWith("space-") ?? false;

    if (spaceIdError || currentSpaceError) {
      const shouldDbKey = spaceIdError ? spaceId : currentSpace!.id;
      const newId = shouldDbKey.slice(6);
      console.log(`Fixing space ID: ${shouldDbKey} -> ${newId}`);
      await thunkAPI.dispatch(
        patch({ dbKey: shouldDbKey, changes: { id: newId } })
      );
    }
  }),
});
