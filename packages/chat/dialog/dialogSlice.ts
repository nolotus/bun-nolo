import {
  type PayloadAction,
  asyncThunkCreator,
  buildCreateSlice,
} from "@reduxjs/toolkit";
import type { NoloRootState } from "app/store";
import { deleteDialogMsgs } from "chat/messages/messageSlice";
import { read, selectById, patch } from "database/dbSlice"; // 引入 patch 函数
import { createDialogAction } from "./actions/createDialogAction";
import { updateDialogTitleAction } from "./actions/updateDialogTitleAction";
import { updateTokensAction } from "./actions/updateTokensAction";
import { extractCustomId } from "core/prefix";
import { deleteDialogAction } from "./actions/deleteDialogAction";
import {
  deleteContentFromSpace,
  selectCurrentSpaceId,
} from "create/space/spaceSlice";

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

interface TokenMetrics {
  cache_creation_input_tokens: number; // 缓存创建的输入token
  cache_read_input_tokens: number; // 缓存读取的输入token
  output_tokens: number; // 输出token
  input_tokens: number; // 输入token
}

const DialogSlice = createSliceWithThunks({
  name: "chat",
  initialState: {
    currentDialogKey: null, // 使用 currentDialogKey
    currentDialogTokens: {
      inputTokens: 0,
      outputTokens: 0,
    },
  },
  reducers: (create) => ({
    updateTokens: create.asyncThunk(updateTokensAction, {
      fulfilled: (state, action: PayloadAction<TokenMetrics>) => {
        // 分别更新输入和输出token
        if (action.payload.input_tokens) {
          state.currentDialogTokens.inputTokens += action.payload.input_tokens;
        }
        if (action.payload.output_tokens) {
          state.currentDialogTokens.outputTokens +=
            action.payload.output_tokens;
        }
      },
    }),

    resetCurrentDialogTokens: create.reducer((state) => {
      state.currentDialogTokens = { inputTokens: 0, outputTokens: 0 };
    }),
    initDialog: create.asyncThunk(
      async (id, thunkApi) => {
        const { dispatch } = thunkApi;
        const action = await dispatch(read(id));
        return { ...action.payload };
      },
      {
        pending: (state, action) => {
          state.currentDialogKey = action.meta.arg; // 使用 currentDialogKey
        },
      }
    ),
    deleteDialog: create.asyncThunk(deleteDialogAction, {
      fulfilled: (state) => {
        state.currentDialogKey = null; // 使用 currentDialogKey
      },
    }),
    deleteCurrentDialog: create.asyncThunk(
      async (dialogKey, thunkApi) => {
        const dispatch = thunkApi.dispatch;
        const state = thunkApi.getState();
        dispatch(deleteDialog(dialogKey));
        const spaceId = selectCurrentSpaceId(state);
        dispatch(deleteContentFromSpace({ contentKey: dialogKey, spaceId }));
        const dialogId = extractCustomId(dialogKey);
        dispatch(deleteDialogMsgs(dialogId));
        dispatch(resetCurrentDialogTokens());
      },
      {
        fulfilled: (state, action) => {},
      }
    ),

    // 清空数据
    clearDialogState: create.reducer((state) => {
      state.currentDialogKey = null; // 使用 currentDialogKey
      state.currentDialogTokens = { inputTokens: 0, outputTokens: 0 };
    }),
    createDialog: create.asyncThunk(createDialogAction),
    updateDialogTitle: create.asyncThunk(updateDialogTitleAction),

    // 新增：添加 Cybot 到当前对话
    addCybot: create.asyncThunk(
      async (cybotId: string, thunkApi) => {
        const { dispatch, getState } = thunkApi;
        const state = getState();
        const currentDialogKey = state.dialog.currentDialogKey; // 使用 currentDialogKey

        if (!currentDialogKey) {
          throw new Error("No current dialog selected");
        }

        // 获取当前对话配置
        const dialogConfig = selectById(state, currentDialogKey);
        if (!dialogConfig) {
          throw new Error("Dialog configuration not found");
        }

        // 确保 cybots 数组存在，并检查是否已包含该 cybotId
        const updatedCybots = dialogConfig.cybots
          ? [...dialogConfig.cybots, cybotId].filter(
              (id, index, arr) => arr.indexOf(id) === index
            )
          : [cybotId];

        // 使用 patch 更新 cybots 数组和 updatedAt 字段
        const changes = {
          cybots: updatedCybots,
          updatedAt: new Date().toISOString(), // 更新时间戳
        };

        // 调用 patch 更新数据库
        const updatedConfig = await dispatch(
          patch({ dbKey: currentDialogKey, changes })
        ).unwrap();
        return updatedConfig;
      },
      {
        fulfilled: (state, action) => {
          // 由于数据已通过 patch 更新到数据库，此处无需额外更新状态
        },
      }
    ),

    // 新增：从当前对话中移除 Cybot
    removeCybot: create.asyncThunk(
      async (cybotId: string, thunkApi) => {
        const { dispatch, getState } = thunkApi;
        const state = getState();
        const currentDialogKey = state.dialog.currentDialogKey; // 使用 currentDialogKey

        if (!currentDialogKey) {
          throw new Error("No current dialog selected");
        }

        // 获取当前对话配置
        const dialogConfig = selectById(state, currentDialogKey);
        if (!dialogConfig) {
          throw new Error("Dialog configuration not found");
        }

        // 过滤掉要移除的 cybotId
        const updatedCybots = dialogConfig.cybots
          ? dialogConfig.cybots.filter((id: string) => id !== cybotId)
          : [];

        // 使用 patch 更新 cybots 数组和 updatedAt 字段
        const changes = {
          cybots: updatedCybots,
          updatedAt: new Date().toISOString(), // 更新时间戳
        };

        // 调用 patch 更新数据库
        const updatedConfig = await dispatch(
          patch({ dbKey: currentDialogKey, changes })
        ).unwrap();
        return updatedConfig;
      },
      {
        fulfilled: (state, action) => {
          // 由于数据已通过 patch 更新到数据库，此处无需额外更新状态
        },
      }
    ),
  }),
});

export const {
  initDialog,
  deleteDialog,
  resetCurrentDialogTokens,
  updateTokens,
  clearDialogState,
  deleteCurrentDialog,
  createDialog,
  updateDialogTitle,
  addCybot, // 新增导出
  removeCybot, // 新增导出
} = DialogSlice.actions;

export default DialogSlice.reducer;

export const selectCurrentDialogConfig = (state: NoloRootState) =>
  selectById(state, state.dialog.currentDialogKey); // 使用 currentDialogKey

export const selectTotalDialogTokens = (state: NoloRootState): number =>
  state.dialog.currentDialogTokens.inputTokens +
  state.dialog.currentDialogTokens.outputTokens;
