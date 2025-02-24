import type { NoloRootState } from "app/store";
import {
  type PayloadAction,
  asyncThunkCreator,
  buildCreateSlice,
} from "@reduxjs/toolkit";
import {
  SpaceData,
  MemberRole,
  SpaceMemberWithSpaceInfo,
} from "create/space/types";

// Actions
import { deleteSpaceAction } from "./action/deleteSpaceAction";
import { addContentAction } from "./action/addContentAction";
import { deleteContentFromSpaceAction } from "./action/deleteContentFromSpaceAction";
import { addSpaceAction } from "./action/addSpace";
import { updateSpaceAction } from "./action/updateSpaceAction";
import { fetchUserSpaceMembershipsAction } from "./action/fetchUserSpaceMemberships";
import { addMemberAction } from "./action/addMemberAction";
import { removeMemberAction } from "./action/removeMemberAction";
import { addCategoryAction } from "./action/addCategoryAction";
import { deleteCategoryAction } from "./action/deleteCategoryAction";
import { updateCategoryNameAction } from "./action/updateCategoryNameAction";
import { reorderCategoriesAction } from "./action/reorderCategoriesAction";
import { fetchSpaceMembershipsAction } from "./action/fetchSpaceMembershipsAction";
import { updateContentCategoryAction } from "./action/updateContentCategoryAction";
import { initializeSpaceAction } from "./action/initializeSpaceAction";
import { read } from "database/dbSlice";
import { createSpaceKey } from "./spaceKeys";

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

interface SpaceState {
  currentSpaceId: string | null;
  currentSpace: SpaceData | null;
  memberSpaces: SpaceMemberWithSpaceInfo[] | null;
  loading: boolean;
  error?: string;
  initialized: boolean;
}

const initialState: SpaceState = {
  currentSpaceId: null,
  currentSpace: null,
  memberSpaces: null,
  loading: true,
  initialized: false,
};

const spaceSlice = createSliceWithThunks({
  name: "space",
  initialState,
  reducers: (create) => ({
    changeSpace: create.asyncThunk(
      async (spaceId: string, thunkAPI) => {
        const dispatch = thunkAPI.dispatch;
        const id = createSpaceKey.space(spaceId);
        const spaceData = await dispatch(read(id)).unwrap();
        if (!spaceData) {
          throw new Error("Space not found");
        }
        return {
          spaceId,
          spaceData,
        };
      },
      {
        fulfilled: (state, action) => {
          state.currentSpaceId = action.payload.spaceId;
          state.currentSpace = action.payload.spaceData;
          state.initialized = true;
        },
        rejected: (state, action) => {
          state.error = action.error.message;
          state.initialized = true;
        },
      }
    ),

    addSpace: create.asyncThunk(addSpaceAction, {
      fulfilled: (state, action) => {
        if (state.memberSpaces) {
          state.memberSpaces.push(action.payload);
        } else {
          state.memberSpaces = [action.payload];
        }
      },
    }),

    addContentToSpace: create.asyncThunk(addContentAction, {
      fulfilled: (state, action) => {
        const { spaceId, updatedSpaceData } = action.payload;
        if (state.currentSpaceId === spaceId) {
          state.currentSpace = updatedSpaceData;
        }
      },
    }),

    fetchUserSpaceMemberships: create.asyncThunk(
      fetchUserSpaceMembershipsAction,
      {
        fulfilled: (state, action) => {
          state.memberSpaces = action.payload;
          state.loading = false;
        },
        pending: (state) => {
          state.loading = true;
        },
        rejected: (state, action) => {
          state.loading = false;
          state.error = action.error.message;
        },
      }
    ),

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
        }
      },
    }),

    updateSpace: create.asyncThunk(updateSpaceAction, {
      fulfilled: (state, action) => {
        const { updatedSpace, spaceId } = action.payload;
        if (spaceId === state.currentSpaceId) {
          state.currentSpace = updatedSpace;
        }
        if (state.memberSpaces) {
          state.memberSpaces = state.memberSpaces.map((space) =>
            space.spaceId === updatedSpace.id
              ? { ...space, spaceName: updatedSpace.name }
              : space
          );
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

    initializeSpace: create.asyncThunk(initializeSpaceAction, {
      fulfilled: (state) => {
        state.loading = false;
        state.initialized = true;
      },
      pending: (state) => {
        state.loading = true;
        state.currentSpaceId = null;
        state.currentSpace = null;
      },
      rejected: (state, action) => {
        state.loading = false;
        state.initialized = true;
        state.error = action.error.message;
      },
    }),

    addMember: create.asyncThunk(addMemberAction, {
      fulfilled: (state, action) => {
        if (state.currentSpaceId === action.payload.spaceId) {
          state.currentSpace = action.payload.updatedSpaceData;
        }
      },
    }),

    removeMember: create.asyncThunk(removeMemberAction, {
      fulfilled: (state, action) => {
        if (state.currentSpaceId === action.payload.spaceId) {
          state.currentSpace = action.payload.updatedSpaceData;
        }
      },
    }),

    addCategory: create.asyncThunk(addCategoryAction, {
      fulfilled: (state, action) => {
        if (state.currentSpaceId === action.payload.spaceId) {
          state.currentSpace = action.payload.updatedSpaceData;
        }
      },
    }),

    deleteCategory: create.asyncThunk(deleteCategoryAction, {
      fulfilled: (state, action) => {
        if (state.currentSpaceId === action.payload.spaceId) {
          state.currentSpace = action.payload.updatedSpaceData;
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

    updateContentCategory: create.asyncThunk(updateContentCategoryAction, {
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

    fetchSpaceMemberships: create.asyncThunk(fetchSpaceMembershipsAction, {
      fulfilled: (state, action) => {
        if (
          state.currentSpaceId === action.payload.spaceId &&
          state.currentSpace
        ) {
          state.currentSpace.members = action.payload.members;
        }
      },
    }),
  }),
});

export const {
  changeSpace,
  addSpace,
  deleteSpace,
  updateSpace,
  addContentToSpace,
  deleteContentFromSpace,
  initializeSpace,
  fetchUserSpaceMemberships,
  addMember,
  removeMember,
  addCategory,
  deleteCategory,
  updateCategoryName,
  updateContentCategory,
  reorderCategories,
  fetchSpaceMemberships,
} = spaceSlice.actions;

// Selectors
export const selectCurrentSpaceId = (state: NoloRootState) =>
  state.space.currentSpaceId;
export const selectCurrentSpace = (state: NoloRootState) =>
  state.space.currentSpace;
export const selectAllMemberSpaces = (state: NoloRootState) =>
  state.space.memberSpaces || [];
export const selectOwnedMemberSpaces = (state: NoloRootState) =>
  (state.space.memberSpaces || []).filter(
    (space) => space.role === MemberRole.OWNER
  );

export default spaceSlice.reducer;
