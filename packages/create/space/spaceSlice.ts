import type { NoloRootState } from "app/store";

import {
  type PayloadAction,
  asyncThunkCreator,
  buildCreateSlice,
} from "@reduxjs/toolkit";
import { read } from "database/dbSlice";

import { createSpaceKey } from "create/space/spaceKeys";

import {
  SpaceData,
  MemberRole,
  SpaceMemberWithSpaceInfo,
} from "create/space/types";
import { getSettings } from "setting/settingSlice";

import { deleteSpaceAction } from "./action/deleteSpaceAction";
import { addContentAction } from "./action/addContentAction";
import { deleteContentFromSpaceAction } from "./action/deleteContentFromSpaceAction";
import { addSpaceAction } from "./action/addSpace";
import { updateSpaceAction } from "./action/updateSpaceAction";
import { fetchUserSpaceMembershipsAction } from "./action/fetchUserSpaceMemberships";

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
    fetchSpaceMemberships: create.asyncThunk(async () => {}, {
      fulfilled: () => {},
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

        // 从memberSpaces中移除
        if (state.memberSpaces) {
          state.memberSpaces = state.memberSpaces.filter(
            (space) => space.spaceId !== spaceId
          );
        }
        const isCurrentSpace = spaceId === state.currentSpaceId;
        // 只有在删除的是当前space时才清除currentSpace相关状态
        if (isCurrentSpace) {
          state.currentSpace = null;
          state.currentSpaceId = null;
        }
      },
    }),

    updateSpace: create.asyncThunk(updateSpaceAction, {
      fulfilled: (state, action) => {
        const { updatedSpace, spaceId } = action.payload;
        const isCurrentSpace = spaceId === state.currentSpaceId;
        // 只有在更新的是当前space时才更新currentSpace
        if (isCurrentSpace) {
          state.currentSpace = updatedSpace;
        }

        // 更新memberSpaces列表中的space名称
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
        const isCurrentSpace = spaceId === state.currentSpaceId;
        if (isCurrentSpace && state.currentSpace) {
          state.currentSpace = updatedSpaceData;
        }
      },
    }),
    initializeSpace: create.asyncThunk(
      async (userId: string | undefined, thunkAPI) => {
        const dispatch = thunkAPI.dispatch;
        const state = thunkAPI.getState() as NoloRootState;

        // 尝试按顺序从不同来源获取空间ID
        const getSpaceId = async (): Promise<string | null> => {
          // 1. 从用户设置中获取
          try {
            const settings = await dispatch(getSettings(userId)).unwrap();
            const defaultSpaceId = settings?.userSetting?.defaultSpaceId;
            if (defaultSpaceId) {
              console.log("Using space ID from settings");
              return defaultSpaceId;
            }
          } catch (error) {
            console.warn("Failed to load settings:", error);
          }
          try {
            const memberships = await dispatch(
              fetchUserSpaceMemberships(userId)
            ).unwrap();
            if (memberships && memberships.length > 0) {
              return memberships[0].spaceId;
            }
          } catch (error) {
            console.warn("Failed to fetch memberships:", error);
          }

          return null;
        };

        try {
          const spaceId = await getSpaceId();

          if (spaceId) {
            await dispatch(changeSpace(spaceId)).unwrap();
            return spaceId;
          }

          console.log("No space available to initialize");
          return null;
        } catch (error) {
          console.error("Space initialization failed:", error);
          throw error;
        }
      },
      {
        fulfilled: (state, action) => {
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
      }
    ),
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
  fetchSpaceMemberships,
  fetchUserSpaceMemberships,
} = spaceSlice.actions;

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
