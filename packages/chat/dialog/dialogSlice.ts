import {
  PayloadAction,
  buildCreateSlice,
  asyncThunkCreator,
} from "@reduxjs/toolkit";
import { NoloRootState } from "app/store";
import { API_ENDPOINTS } from "database/config";
import { deleteData, read, write } from "database/dbSlice";
import { noloRequest } from "utils/noloRequest";
import { clearMessages } from "../messages/messageSlice";
import { selectCurrentUserId } from "auth/authSlice";
import { DataType } from "create/types";

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

const DialogSlice = createSliceWithThunks({
  name: "chat",
  initialState: {
    currentDialogId: null,
    currentDialogConfig: null,
    currenLLMConfig: null,
  },
  reducers: (create) => ({
    setCurrentDialogId: create.reducer(
      (state, action: PayloadAction<string>) => {
        state.currentDialogId = action.payload;
      },
    ),
    initDialog: create.asyncThunk(
      async (args, thunkApi) => {
        const { dialogId, source } = args;
        const { dispatch } = thunkApi;
        dispatch(setCurrentDialogId(dialogId));
        const action = await dispatch(read({ id: dialogId, source }));
        return action.payload;
      },
      {
        pending: (state) => {
          // state.loading = true;
          state.currenLLMConfig = null;
          state.currentDialogConfig = null;
        },
        rejected: (state, action) => {},
        fulfilled: (state, action) => {
          state.currentDialogConfig = action.payload;
        },
      },
    ),

    initLLMConfig: create.asyncThunk(
      async (llmID: string, thunkApi) => {
        const action = await thunkApi.dispatch(read({ id: llmID }));
        return action.payload;
      },
      {
        fulfilled: (state, action) => {
          state.currenLLMConfig = action.payload;
        },
      },
    ),
    deleteDialog: create.asyncThunk(
      async (dialog, thunkApi) => {
        try {
          const state = thunkApi.getState();
          thunkApi.dispatch(clearMessages());
          if (dialog.messageListId) {
            await noloRequest(state, {
              url: `${API_ENDPOINTS.DATABASE}/delete/${dialog.messageListId}`,
              method: "DELETE",
              body: JSON.stringify({ ids: state.message.ids }),
            });
          }
          const action = await thunkApi.dispatch(deleteData(dialog.id));
          console.log("deleteDialog res", action);
          // const result = await res.json();
          // console.log("result", result);
          // return result;
          return action;
        } catch (error) {
          console.error("Failed to delete:", error);
        }
      },
      {
        rejected: () => {},
        fulfilled: (state, action) => {},
      },
    ),
    createDialog: create.asyncThunk(
      async (llmId, thunkApi) => {
        const state = thunkApi.getState();
        const currentUserId = selectCurrentUserId(state);
        const dispatch = thunkApi.dispatch;
        const messageListConfig = {
          data: [],
          flags: { isList: true },
          userId: currentUserId,
        };
        const writeMessageAction = await dispatch(write(messageListConfig));
        const initMessageList = writeMessageAction.payload;
        const dialogConfig = {
          data: {
            type: DataType.Dialog,
            llmId,
            messageListId: initMessageList.id,
          },
          flags: { isJSON: true },
          userId: currentUserId,
        };
        const writeDialogAction = await dispatch(write(dialogConfig));
        return writeDialogAction.payload;
      },
      {
        fulfilled: (state, action) => {},
      },
    ),
  }),
});
export const {
  initDialog,
  setCurrentDialogId,
  initLLMConfig,
  deleteDialog,
  createDialog,
} = DialogSlice.actions;

export default DialogSlice.reducer;
export const selectCurrentLLMConfig = (state: NoloRootState) =>
  state.dialog.currenLLMConfig;

export const selectCurrentDialogConfig = (state: NoloRootState) =>
  state.dialog.currentDialogConfig;
