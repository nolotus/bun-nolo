// create/space/spaceThunks.ts
import { asyncThunkCreator } from "@reduxjs/toolkit";
import { patch, read } from "database/dbSlice"; // Assuming path is correct
import { createSpaceKey } from "./spaceKeys";
import type { SpaceState } from "./spaceSlice"; // Adjust path
import type { SpaceData } from "./types"; // Adjust path
import { addSpaceAction } from "./addSpaceAction";
import { deleteSpaceAction } from "./deleteSpaceAction";
import { updateSpaceAction } from "./updateSpaceAction";
import { fetchSpaceAction } from "./fetchSpaceAction";
import { loadDefaultSpaceAction } from "./loadDefaultSpaceAction";

type Create = ReturnType<typeof asyncThunkCreator<SpaceState>>;

/**
 * 创建与 Space 基本操作相关的 Async Thunks (包括切换 Space)
 * @param create - 由 buildCreateSlice 提供的创建器对象
 */
export const createSpaceThunks = (create: Create) => ({
  // --- Change Space (Core operation) ---
  changeSpace: create.asyncThunk(
    async (spaceId: string, thunkAPI) => {
      const dispatch = thunkAPI.dispatch;
      const spaceKey = createSpaceKey.space(spaceId);
      const spaceData: SpaceData | null = (await dispatch(
        read(spaceKey)
      ).unwrap()) as SpaceData | null;
      if (!spaceData) {
        throw new Error("Space not found or failed to load");
      }
      return {
        spaceId,
        spaceData,
      };
    },
    {
      pending: (state) => {
        state.loading = true;
        state.error = undefined;
      },
      fulfilled: (state, action) => {
        state.currentSpaceId = action.payload.spaceId;
        state.currentSpace = action.payload.spaceData;
        state.initialized = true;
        state.loading = false;
        state.collapsedCategories = {}; // Reset collapse state on space change
      },
      rejected: (state, action) => {
        state.error = action.error.message || "Failed to change space";
        state.initialized = true;
        state.loading = false;
        state.currentSpaceId = null;
        state.currentSpace = null;
        state.collapsedCategories = {};
      },
    }
  ),

  // --- Other Core Space Operations ---
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
      // Actual state update (currentSpaceId, etc.) is handled by the changeSpace thunk dispatched internally.
      // Ensure initialized is set correctly if changeSpace fails.
      if (!state.currentSpaceId) {
        state.initialized = true;
        state.collapsedCategories = {};
      }
    },
    rejected: (state, action) => {
      state.loading = false;
      state.initialized = true;
      state.error = action.error.message || "Failed to load default space";
      state.currentSpaceId = null;
      state.currentSpace = null;
      state.collapsedCategories = {};
    },
  }),

  fetchSpace: create.asyncThunk(fetchSpaceAction, {
    fulfilled: (state, action) => {
      const { spaceId, spaceData } = action.payload;
      // Only update if it's the currently viewed space, maybe fetch is for background refresh?
      // If fetchSpace implies changing the current view, it should behave like changeSpace.
      // Assuming here it just updates the data if it matches the current space.
      if (state.currentSpaceId === spaceId) {
        state.currentSpace = spaceData;
        // Decide if fetch should reset collapse state. If it's a full refresh, yes.
        state.collapsedCategories = {};
      }
    },
    // Optional: Add pending/rejected handlers if needed for UI feedback during fetch.
  }),
  fixSpace: create.asyncThunk(
    (spaceId, thunkAPI) => {
      if (spaceId.startWith("space-")) {
        const newId = spaceId.slice(6);
        thunkAPI.dispatch(patch({ dbKey: spaceId, changes: { id: newId } }));
      }
    },
    {
      fulfilled: (state, action) => {
        const { spaceId, spaceData } = action.payload;
        if (state.currentSpaceId === spaceId) {
          state.currentSpace = spaceData;
        }
      },
    }
  ),
});
