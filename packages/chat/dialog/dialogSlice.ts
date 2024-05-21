import {
  PayloadAction,
  buildCreateSlice,
  asyncThunkCreator,
} from "@reduxjs/toolkit";
import { noloReadRequest } from "database/client/readRequest";
import { API_ENDPOINTS } from "database/config";
import { removeOne } from "database/dbSlice";
import { noloRequest } from "utils/noloRequest";

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
    deleteDialog: create.asyncThunk(
      async (dialog, thunkApi) => {
        try {
          const state = thunkApi.getState();

          if (dialog.messageListId) {
            await noloRequest(state, {
              url: `${API_ENDPOINTS.DATABASE}/delete/${dialog.messageListId}`,
              method: "DELETE",
            });
          }
          const res = await noloRequest(state, {
            url: `${API_ENDPOINTS.DATABASE}/delete/${dialog.id}`,
            method: "DELETE",
          });
          const result = await res.json();
          console.log("result", result);
          thunkApi.dispatch(removeOne(result.id));
          return result;
        } catch (error) {
          console.error("Failed to delete:", error);
        }
      },
      {
        rejected: () => {},
        fulfilled: (state, action) => {},
      },
    ),
  }),
});
export const { initDialog, setCurrentDialogId, initLLMConfig, deleteDialog } =
  DialogSlice.actions;

export default DialogSlice.reducer;
export const selectCurrentLLMConfig = (state) => state.dialog.currenLLMConfig;
export const selectCurrentDialogConfig = (state) =>
  state.dialog.currentDialogConfig;
