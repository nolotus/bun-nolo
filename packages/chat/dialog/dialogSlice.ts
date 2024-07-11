import {
  PayloadAction,
  buildCreateSlice,
  asyncThunkCreator,
} from "@reduxjs/toolkit";
import { NoloRootState } from "app/store";
import { deleteData, read, removeOne } from "database/dbSlice";
import { clearMessages } from "../messages/messageSlice";

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
        dispatch(removeOne(dialog.id));
        dispatch(clearMessages());
        const deleteConfig = { id: dialog.id, source: dialog.source };

        if (dialog.messageListId) {
          const body = { ids: state.message.ids };
          const deleteMesssagListAction = await dispatch(
            deleteData({
              id: dialog.messageListId,
              body,
              source: dialog.source,
            }),
          );
          await dispatch(deleteData(deleteConfig));
        } else {
          await dispatch(deleteData(deleteConfig));
        }
      },
      {
        fulfilled: (state) => {
          state.currenLLMConfig = null;
          state.currentDialogConfig = null;
          state.currentDialogId = null;
        },
      },
    ),
  }),
});
export const { initDialog, setCurrentDialogId, initLLMConfig, deleteDialog } =
  DialogSlice.actions;

export default DialogSlice.reducer;
export const selectCurrentLLMConfig = (state: NoloRootState) =>
  state.dialog.currenLLMConfig;

export const selectCurrentDialogConfig = (state: NoloRootState) =>
  state.dialog.currentDialogConfig;
