import {
  PayloadAction,
  buildCreateSlice,
  asyncThunkCreator,
} from "@reduxjs/toolkit";
import { DataType } from "create/types";
import { API_ENDPOINTS } from "database/config";
import { upsertMany } from "database/dbSlice";

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

const DialogSlice = createSliceWithThunks({
  name: "chat",
  initialState: {
    llmConfig: {},
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
        const res = await fetch(
          `http://localhost${API_ENDPOINTS.DATABASE}/read/${dialogId}`,
        );
        const result = await res.json();
        return result;
      },

      {
        pending: (state) => {
          // state.loading = true;
        },
        fulfilled: (state, action) => {
          state.currentDialogConfig = action.payload;
        },
      },
    ),

    fetchDialogList: create.asyncThunk(
      async (id: string, thunkApi) => {
        const state = thunkApi.getState();
        const userId = state.auth.currentUser.userId;
        const token = state.auth.currentToken;

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
        const res = await fetch(
          `http://localhost${API_ENDPOINTS.DATABASE}/query/${userId}?${queryParams}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(options.condition),
          },
        );
        const result = await res.json();
        thunkApi.dispatch(upsertMany(result));
        return result;
      },
      {
        fulfilled: (state, action) => {
          state.llmConfig = action.payload;
        },
      },
    ),
    initLLMConfig: create.asyncThunk(
      async (llmID: string, thunkApi) => {
        const res = await fetch(
          `http://localhost${API_ENDPOINTS.DATABASE}/read/${llmID}`,
        );
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
