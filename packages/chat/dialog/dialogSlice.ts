import {
  PayloadAction,
  buildCreateSlice,
  asyncThunkCreator,
} from "@reduxjs/toolkit";
import { noloReadRequest } from "database/client/readRequest";
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
      async (dialogId, thunkApi) => {
        thunkApi.dispatch(setCurrentDialogId(dialogId));
        const state = thunkApi.getState();
        const res = await noloReadRequest(state, dialogId);
        const result = await res.json();
        return result;
      },

      {
        pending: (state) => {
          // state.loading = true;
        },
        rejected: (a, action) => {},
        fulfilled: (state, action) => {
          state.currentDialogConfig = action.payload;
        },
      },
    ),

    initLLMConfig: create.asyncThunk(
      async (llmID: string, thunkApi) => {
        const state = thunkApi.getState();
        const res = await noloReadRequest(state, llmID);
        return await res.json();
      },
      {
        fulfilled: (state, action) => {
          state.currenLLMConfig = action.payload;
        },
      },
    ),
    deleteDialog: create.asyncThunk(async () => {}, {}),
  }),
});
export const { initDialog, setCurrentDialogId, initLLMConfig } =
  DialogSlice.actions;

export default DialogSlice.reducer;
export const selectCurrentLLMConfig = (state) => state.dialog.currenLLMConfig;
export const selectCurrentDialogConfig = (state) =>
  state.dialog.currentDialogConfig;
