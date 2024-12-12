import type { NoloRootState } from "app/store";

import {
  PayloadAction,
  buildCreateSlice,
  asyncThunkCreator,
} from "@reduxjs/toolkit";
import { selectCurrentUserId } from "auth/authSlice";
import { patchData, query, queryServer, write } from "database/dbSlice";
import { selectCurrentServer } from "setting/settingSlice";
import { deleteData } from "database/dbSlice";
import { queryFilteredFromIndexedDB } from "database/browser/indexedDBQuery";

import { DataType } from "../types";

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

interface workspaceState {
  currentWorkspaceId: string | null;
  currentWorkspace: any;
  workspaces: [] | null;
  loading: boolean;
}

const initialState: workspaceState = {
  currentWorkspaceId: null,
  currentWorkspace: null,
  workspaces: null,
  loading: true,
};

const workspaceSlice = createSliceWithThunks({
  name: "workspace",
  initialState,
  reducers: (create) => ({
    fetchWorkspaces: create.asyncThunk(
      async (input, thunkAPI) => {
        const dispatch = thunkAPI.dispatch;
        const state = thunkAPI.getState();
        const currentUserId = selectCurrentUserId(state);
        if (currentUserId === "local") {
          console.log("fetchWorkspaces local");
          const jsonLogicRules = {
            "===": [{ var: "type" }, "worksapce"],
          };
          const options = {
            jsonLogicRules: jsonLogicRules,
            limit: 10, // 例如限制结果数量为10
          };
          const reuslt = await queryFilteredFromIndexedDB(
            currentUserId,
            options
          );
          console.log("fetchWorkspaces reuslt", reuslt);
          return reuslt;
        } else {
          const queryConfig = {
            queryUserId: currentUserId,
            options: {
              isJSON: true,
              limit: 20,
              condition: {
                type: DataType.Space,
              },
            },
          };
          const currentServer = selectCurrentServer(state);
          const action = await dispatch(
            queryServer({
              server: currentServer,
              ...queryConfig,
            })
          );
          return action.payload || [];
        }
      },
      {
        fulfilled: (state, action) => {
          const { payload } = action;
          state.workspaces = payload;
        },
      }
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
      }
    ),

    addWorkspace: create.asyncThunk(
      async (name: string, thunkAPI) => {
        if (typeof name !== "string") {
          return;
        }
        const dispatch = thunkAPI.dispatch;
        const state = thunkAPI.getState();
        const currentUserId = selectCurrentUserId(state);
        const config = {
          data: {
            type: DataType.Space,
            name,
          },
          flags: { isJSON: true },
          userId: currentUserId,
        };

        const actionResult = await dispatch(write(config));
        console.log("addWorkspace", actionResult);
        return actionResult.payload;
      },
      {
        fulfilled: (state, action) => {
          console.log("action", action);
          state.workspaces?.push(action.payload);
        },
      }
    ),
    deleteWorkspace: create.asyncThunk(
      async (workspaceId: string, thunkAPI) => {
        const dispatch = thunkAPI.dispatch;
        await dispatch(deleteData({ id: workspaceId }));
        return workspaceId;
      },
      {
        fulfilled: (state, action) => {
          const workspaceId = action.payload;
          state.workspaces = state.workspaces.filter(
            (workspace: any) => workspace.id !== workspaceId
          );
          if (state.currentWorkspaceId === workspaceId) {
            state.currentWorkspaceId = "recent";
          }
        },
      }
    ),
    queryDialogList: create.asyncThunk(async (workspaceId, thunkAPI) => {
      const state = thunkAPI.getState();
      const currentUserId = selectCurrentUserId(state);
      let condition = {};
      if (workspaceId) {
        condition = {
          type: DataType.Dialog,
          workspaceId: state.workspaceId,
        };
      } else {
        condition = {
          type: DataType.Dialog,
        };
      }

      const queryConfig = {
        queryUserId: currentUserId,
        options: {
          isJSON: true,
          limit: 200,
          condition,
        },
      };
      await thunkAPI.dispatch(query(queryConfig));
    }, {}),
  }),
});

export const {
  addToWorkspace,
  fetchWorkspaces,
  changeWorkSpace,
  addWorkspace,
  deleteWorkspace,
  queryDialogList,
} = workspaceSlice.actions;

export const selectAllWorkspaces = (state: NoloRootState) =>
  state.workspace.workspaces;

export const selectCurrentWorkSpaceId = (state: NoloRootState) =>
  state.workspace.currentWorkspaceId;

export const selectCurrentWorkspaceName = (state: NoloRootState) => {
  const currentId = state.workspace.currentWorkspaceId;
  const workspaces = state.workspace.workspaces;
  if (!currentId) return "";
  if (currentId === null) return "recent";

  if (!workspaces) return "";

  const workspace = workspaces.find((w: any) => w.id === currentId);
  return workspace ? workspace.name : "";
};

export default workspaceSlice.reducer;
