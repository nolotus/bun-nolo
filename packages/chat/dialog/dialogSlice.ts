import {
  PayloadAction,
  buildCreateSlice,
  asyncThunkCreator,
} from "@reduxjs/toolkit";
import { NoloRootState } from "app/store";
import { deleteData, read, write } from "database/dbSlice";
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
        return { ...action.payload, source };
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
        const { dispatch, getState } = thunkApi;
        const state = getState();
        thunkApi.dispatch(clearMessages());
        if (dialog.messageListId) {
          const body = { ids: state.message.ids };

          const deleteMesssagListAction = await dispatch(
            deleteData({
              id: dialog.messageListId,
              body,
              source: dialog.source,
            }),
          );
          const deleteConfig = { id: dialog.id, source: dialog.source };
          const deleteDialogAction = await dispatch(deleteData(deleteConfig));
        }
      },
      {
        fulfilled: () => {},
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
            title: new Date().toISOString(),
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
