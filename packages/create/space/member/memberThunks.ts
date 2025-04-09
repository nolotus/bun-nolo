// create/space/member/memberThunks.ts
import { asyncThunkCreator } from "@reduxjs/toolkit";
import type { SpaceState } from "../spaceSlice"; // Adjust path
import { fetchUserSpaceMembershipsAction } from "./fetchUserSpaceMembershipsAction";
import { addMemberAction } from "./addMemberAction";
import { removeMemberAction } from "./removeMemberAction";

type Create = ReturnType<typeof asyncThunkCreator<SpaceState>>;

/**
 * 创建与成员相关的 Async Thunks
 * @param create - 由 buildCreateSlice 提供的创建器对象
 */
export const createMemberThunks = (create: Create) => ({
  fetchUserSpaceMemberships: create.asyncThunk(
    fetchUserSpaceMembershipsAction,
    {
      pending: (state) => {
        state.loading = true;
      },
      fulfilled: (state, action) => {
        state.memberSpaces = action.payload;
        state.loading = false;
      },
      rejected: (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      },
    }
  ),

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
});
