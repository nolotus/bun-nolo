import type { NoloRootState } from "app/store";

import {
  type PayloadAction,
  asyncThunkCreator,
  buildCreateSlice,
} from "@reduxjs/toolkit";
import { selectCurrentUserId } from "auth/authSlice";
import { read, write } from "database/dbSlice";

import { createSpaceKey } from "create/space/spaceKeys";

import {
  SpaceData,
  MemberRole,
  SpaceId,
  SpaceMemberWithSpaceInfo,
} from "create/space/types";
import { browserDb } from "database/browser/db";
import { getSettings } from "setting/settingSlice";

import { deleteSpaceAction } from "./action/deleteSpaceAction";
import { addContentAction } from "./action/addContentAction";
import { deleteContentFromSpaceAction } from "./action/deleteContentFromSpaceAction";
import { addSpaceAction } from "./action/addSpace";

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
    fetchSpaceMemberships: create.asyncThunk(
      async (userId, thunkAPI) => {
        const dispatch = thunkAPI.dispatch;
        const state = thunkAPI.getState();

        try {
          const memberships: SpaceMemberWithSpaceInfo[] = [];

          // 查询用户的所有space-member记录
          const memberPrefix = `space-member-${userId}-`;
          for await (const [key, memberData] of browserDb.iterator({
            gte: memberPrefix,
            lte: memberPrefix + "\xff",
          })) {
            const membership = memberData;

            memberships.push(membership);
          }
          // 按加入时间排序
          const result = memberships.sort((a, b) => b.joinedAt - a.joinedAt);
          return result;
        } catch (error) {
          console.error("Error fetching space memberships:", error);
          throw error;
        }
      },
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

    updateSpace: create.asyncThunk(
      async (input: { spaceId: string; spaceName: string }, thunkAPI) => {
        const { spaceId, spaceName } = input;
        const dispatch = thunkAPI.dispatch;
        const state = thunkAPI.getState();
        const userId = selectCurrentUserId(state);

        // 获取space数据
        const spaceKey = createSpaceKey.space(spaceId);
        const spaceData = await dispatch(read(spaceKey)).unwrap();

        if (!spaceData) {
          throw new Error("Space not found");
        }

        if (!spaceData.members.includes(userId)) {
          throw new Error("User is not a member of this space");
        }

        // 更新space数据
        const updatedSpaceData = {
          ...spaceData,
          name: spaceName,
          updatedAt: Date.now(),
        };

        // 写入更新后的space数据
        await dispatch(
          write({
            data: updatedSpaceData,
            customKey: spaceKey,
          })
        ).unwrap();

        // 更新space-member数据
        const memberKey = createSpaceKey.member(userId, spaceId);
        const memberData = await dispatch(read(memberKey)).unwrap();

        if (memberData) {
          const updatedMemberData = {
            ...memberData,
            spaceName,
          };

          await dispatch(
            write({
              data: updatedMemberData,
              customKey: memberKey,
            })
          ).unwrap();
        }

        return {
          updatedSpace: updatedSpaceData,
          spaceId,
        };
      },
      {
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
      }
    ),
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
              fetchSpaceMemberships(userId)
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
