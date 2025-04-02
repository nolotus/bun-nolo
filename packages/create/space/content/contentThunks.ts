// src/create/space/content/contentThunks.ts
import { asyncThunkCreator } from "@reduxjs/toolkit";
import type { SpaceState } from "../spaceSlice"; // Adjust path
import type { SpaceData } from "../types"; // Adjust path
import { addContentAction } from "./addContentAction";
import { deleteContentFromSpaceAction } from "./deleteContentFromSpaceAction";
import { moveContentAction } from "./moveContentAction";
import { updateContentTitleAction } from "./updateContentTitleAction";
import { updateContentCategoryAction } from "./updateContentCategoryAction"; // Import from here

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
      const { spaceId, updatedSpaceData } = action.payload;
      if (state.currentSpaceId === spaceId) {
        state.currentSpace = updatedSpaceData;
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

  updateContentTitle: create.asyncThunk(updateContentTitleAction, {
    fulfilled: (state, action) => {
      if (state.currentSpaceId === action.payload.spaceId) {
        state.currentSpace = action.payload.updatedSpaceData;
      }
    },
  }),

  // Thunk for updating a content item's category
  updateContentCategory: create.asyncThunk(updateContentCategoryAction, {
    fulfilled: (state, action) => {
      if (state.currentSpaceId === action.payload.spaceId) {
        state.currentSpace = action.payload.updatedSpaceData;
      }
    },
  }),
});
