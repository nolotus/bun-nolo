import { asyncThunkCreator } from "@reduxjs/toolkit";
import type { SpaceState } from "../spaceSlice"; // Adjust path
import { addContentAction } from "./addContentAction";
import { deleteContentFromSpaceAction } from "./deleteContentFromSpaceAction";
import { moveContentAction } from "./moveContentAction";
import { updateContentTitleAction } from "./updateContentTitleAction";
import { updateContentCategoryAction } from "./updateContentCategoryAction";
import { deleteMultipleContentAction } from "./deleteMultipleContentAction"; // <-- 新增: 导入批量删除 Action

type Create = ReturnType<typeof asyncThunkCreator<SpaceState>>;

/**
 * 创建与内容相关的 Async Thunks
 * @param create - 由 buildCreateSlice 提供的创建器对象
 */
export const createContentThunks = (create: Create) => ({
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
      const {
        sourceSpaceId,
        updatedSourceSpaceData,
        targetSpaceId,
        updatedTargetSpaceData,
      } = action.payload;
      if (state.currentSpaceId === sourceSpaceId && updatedSourceSpaceData) {
        state.currentSpace = updatedSourceSpaceData;
      }
      if (state.currentSpaceId === targetSpaceId && updatedTargetSpaceData) {
        state.currentSpace = updatedTargetSpaceData;
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

  // --- 新增: 批量删除内容的 Thunk ---
  deleteMultipleContent: create.asyncThunk(deleteMultipleContentAction, {
    fulfilled: (state, action) => {
      if (state.currentSpaceId === action.payload.spaceId) {
        state.currentSpace = action.payload.updatedSpaceData;
      }
    },
  }),
  // --- 结束新增 ---

  updateContentTitle: create.asyncThunk(updateContentTitleAction, {
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
});
