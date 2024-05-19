import {
  PayloadAction,
  buildCreateSlice,
  asyncThunkCreator,
} from "@reduxjs/toolkit";
import { DataType } from "create/types";
import { noloReadRequest } from "database/client/readRequest";
import { upsertMany } from "database/dbSlice";
import { noloQueryRequest } from "database/client/queryRequest";
import { selectCurrentUserId } from "auth/selectors";
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

    fetchDialogList: create.asyncThunk(
      async (id: string, thunkApi) => {
        const state = thunkApi.getState();
        const userId = selectCurrentUserId(state);

        const options = {
          isJSON: true,
          limit: 20,
          condition: {
            type: DataType.Dialog,
          },
        };
        const queryParams = new URLSearchParams({
          isObject: (options.isObject ?? false).toString(),
          isJSON: (options.isJSON ?? false).toString(),
          limit: options.limit?.toString() ?? "",
        });
        const res = await noloQueryRequest(
          userId,
          state,
          queryParams,
          JSON.stringify(options.condition),
        );
        const result = await res.json();
        thunkApi.dispatch(upsertMany(result));
        return result;
      },
      {
        fulfilled: (state, action) => {
          // state.llmConfig = action.payload;
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
export const {
  initDialog,
  setCurrentDialogId,
  fetchDialogList,
  initLLMConfig,
} = DialogSlice.actions;

export default DialogSlice.reducer;
export const selectCurrentLLMConfig = (state) => state.dialog.currenLLMConfig;
export const selectCurrentDialogConfig = (state) =>
  state.dialog.currentDialogConfig;
