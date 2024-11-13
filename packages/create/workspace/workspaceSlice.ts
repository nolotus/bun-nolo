import type { AppDispatch, NoloRootState } from "app/store";

import {
  PayloadAction,
  buildCreateSlice,
  asyncThunkCreator,
} from "@reduxjs/toolkit";
import { selectCurrentUserId } from "auth/authSlice";
import { patchData, queryServer, write } from "database/dbSlice";
import { selectCurrentServer } from "setting/settingSlice";
import { DataType } from "../types";

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

interface workspaceState {
  currentWorkspaceId: string | null;
  currentWorkspace: any;
  workspaces: [] | null;
  dialogList: [] | null;
}

const initialState: workspaceState = {
  currentWorkspaceId: "all",
  currentWorkspace: null,
  workspaces: null,
};

const workspaceSlice = createSliceWithThunks({
  name: "workspace",
  initialState,
  reducers: (create) => ({
    fetchWorkspaces: create.asyncThunk(
      async (input, thunkAPI) => {
        const dispatch = thunkAPI.dispatch;
        const state = thunkAPI.getState();
        const currentServer = selectCurrentServer(state);
        const currentUserId = selectCurrentUserId(state);
        const queryConfig = {
          queryUserId: currentUserId,
          options: {
            isJSON: true,
            limit: 20,
            condition: {
              type: DataType.WorkSpace,
            },
          },
        };

        const action = await dispatch(
          queryServer({
            server: currentServer,
            ...queryConfig,
          }),
        );
        return action.payload || [];
      },
      {
        fulfilled: (state, action) => {
          const { payload } = action;
          state.workspaces = payload;
        },
      },
    ),
    changeWorkSpace: create.reducer((state, action: PayloadAction<string>) => {
      state.currentWorkspaceId = action.payload;
    }),
    addToWorkspace: create.asyncThunk(
      async (input, thunkAPI) => {
        const { entityId, workspaceId } = input;
        const dispatch = thunkAPI.dispatch;
        const changes = { workspaceId };
        await dispatch(patchData({ id: entityId, changes }));
      },
      {
        fulfilled: (state, action) => {},
      },
    ),

    addWorkspace: create.asyncThunk(async (name: string, thunkAPI) => {
      if (typeof name !== "string") {
        return;
      }
      const dispatch = thunkAPI.dispatch;
      const state = thunkAPI.getState();
      const currentUserId = selectCurrentUserId(state);
      const config = {
        data: {
          type: DataType.WorkSpace,
          name,
        },
        flags: { isJSON: true },
        userId: currentUserId,
      };
      const actionResult = await dispatch(write(config));
      console.log("actionResult", actionResult);
    }, {}),
  }),
});

export const {
  addToWorkspace,
  fetchWorkspaces,
  changeWorkSpace,
  addWorkspace,
} = workspaceSlice.actions;

export const selectAllWorkspaces = (state: NoloRootState) =>
  state.workspace.workspaces;

export const selectCurrentWorkSpaceId = (state: NoloRootState) =>
  state.workspace.currentWorkspaceId;

export const selectCurrentWorkspaceName = (state: NoloRootState) => {
  const currentId = state.workspace.currentWorkspaceId;
  const workspaces = state.workspace.workspaces;

  if (!currentId) return "";
  if (currentId === "all") return "allChats";

  if (!workspaces) return "";

  const workspace = workspaces.find((w: any) => w.id === currentId);
  return workspace ? workspace.name : "";
};

export default workspaceSlice.reducer;
