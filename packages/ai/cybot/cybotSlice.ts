// /ai/cybot/cybotSlice.ts

import { asyncThunkCreator, buildCreateSlice } from "@reduxjs/toolkit";
import { AppThunkApi, RootState } from "app/store";
import { read, remove } from "database/dbSlice";
import { pubCybotKeys } from "database/keys";
import { selectCurrentServer } from "app/settings/settingSlice";
import { generateRequestBody } from "ai/llm/generateRequestBody";
import { fetchReferenceContents } from "ai/context/buildReferenceContext";
import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";
import { selectAllMsgs } from "chat/messages/messageSlice";
import { sendCommonChatRequest } from "../chat/sendCommonRequest";
import { filterAndCleanMessages } from "integrations/openai/filterAndCleanMessages";
import {
  getFullChatContextKeys,
  deduplicateContextKeys,
} from "ai/agent/getFullChatContextKeys";
import { Agent } from "app/types";
import { th } from "date-fns/locale";

type SortBy = "newest" | "popular" | "rating";

interface FetchResult {
  data: Agent[];
  total: number;
  hasMore: boolean;
}

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

//
// —— 原有模型执行核心 ——
//

//
// —— 公共 Cybot 列表相关 ——
//

async function fetchLocalCybots({
  limit = 20,
  sortBy = "newest",
  db,
}: {
  limit?: number;
  sortBy?: SortBy;
  db: any; // 修复类型定义
}): Promise<FetchResult> {
  const { start, end } = pubCybotKeys.list();
  const all: Agent[] = [];
  for await (const [, v] of db.iterator({ gte: start, lte: end })) {
    if (v.isPublic) all.push(v);
  }
  all.sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return (b.dialogCount || 0) - (a.dialogCount || 0);
      case "rating":
        return (b.messageCount || 0) - (a.messageCount || 0);
      case "newest":
      default:
        const ta =
          typeof a.createdAt === "string"
            ? Date.parse(a.createdAt)
            : a.createdAt || 0; // 添加回退值
        const tb =
          typeof b.createdAt === "string"
            ? Date.parse(b.createdAt)
            : b.createdAt || 0; // 添加回退值
        return tb - ta;
    }
  });
  const paginated = all.slice(0, limit);
  return {
    data: paginated,
    total: all.length,
    hasMore: limit < all.length,
  };
}

async function fetchRemoteCybots(
  server: string,
  limit: number,
  sortBy: SortBy
): Promise<FetchResult> {
  const res = await fetch(`${server}/rpc/getPubCybots`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ limit, sortBy }),
  });
  if (!res.ok) throw new Error(`Remote fetch failed: ${res.status}`);
  return res.json();
}

function mergeCybots(
  localData: Agent[],
  remoteData: Agent[]
): { merged: Agent[]; toDelete: string[] } {
  const remoteIds = new Set(remoteData.map((b) => b.id));
  const merged: Agent[] = [];
  const toDelete: string[] = [];

  localData.forEach((bot) => {
    if (remoteIds.has(bot.id)) {
      // 如果远程也存在，以远程为准，这里先添加本地的，后续会被远程的覆盖或合并
    } else {
      toDelete.push(bot.id);
    }
  });

  const localIds = new Set(localData.map((b) => b.id));
  remoteData.forEach((bot) => {
    if (!localIds.has(bot.id)) {
      merged.push(bot);
    }
  });

  // 合并本地和远程数据，并去重
  const combined = [
    ...localData.filter((b) => remoteIds.has(b.id)),
    ...remoteData,
  ];
  const finalMerged = Array.from(
    new Map(combined.map((item) => [item.id, item])).values()
  );

  finalMerged.sort((a, b) => {
    const ta =
      typeof a.createdAt === "string"
        ? Date.parse(a.createdAt)
        : a.createdAt || 0;
    const tb =
      typeof b.createdAt === "string"
        ? Date.parse(b.createdAt)
        : b.createdAt || 0;
    return tb - ta;
  });

  return { merged: finalMerged, toDelete };
}

interface CybotState {
  pubCybots: {
    loading: boolean;
    error: string | null;
    data: Agent[];
  };
}

const initialState: CybotState = {
  pubCybots: {
    loading: false,
    error: null,
    data: [],
  },
};

export const cybotSlice = createSliceWithThunks({
  name: "cybot",
  initialState,
  reducers: (create) => ({
    // ... 其他 thunks 保持不变
    runLlm: create.asyncThunk(
      (args: { cybotId?: string; content: any }, thunkApi) =>
        _executeModel(
          {
            isStreaming: false,
            withAgentContext: false,
            withChatHistory: false,
          },
          args,
          thunkApi
        )
    ),
    streamLlm: create.asyncThunk(
      (
        args: { cybotId?: string; content: any; parentMessageId?: string },
        thunkApi
      ) =>
        _executeModel(
          {
            isStreaming: true,
            withAgentContext: false,
            withChatHistory: false,
          },
          args,
          thunkApi
        )
    ),
    runAgent: create.asyncThunk(
      (args: { cybotId: string; content: any }, thunkApi) =>
        _executeModel(
          {
            isStreaming: false,
            withAgentContext: true,
            withChatHistory: false,
          },
          args,
          thunkApi
        )
    ),
    streamAgent: create.asyncThunk(
      (
        args: { cybotId: string; content: any; parentMessageId?: string },
        thunkApi
      ) =>
        _executeModel(
          { isStreaming: true, withAgentContext: true, withChatHistory: false },
          args,
          thunkApi
        )
    ),
    streamAgentChatTurn: create.asyncThunk(
      async (
        args: {
          cybotId: string;
          userInput: string | any[];
          parentMessageId?: string;
        },
        thunkApi
      ) => {
        const { getState, dispatch, rejectWithValue } = thunkApi;
        const state = getState() as RootState;

        try {
          const { cybotId, userInput, parentMessageId } = args;
          const agentConfig = await dispatch(read(cybotId)).unwrap();

          const keySets = await getFullChatContextKeys(
            state,
            dispatch,
            agentConfig,
            userInput
          );
          const finalKeys = deduplicateContextKeys(keySets);

          const [
            botInstructionsContext,
            currentUserContext,
            smartReadContext,
            historyContext,
            botKnowledgeContext,
          ] = await Promise.all([
            fetchReferenceContents(finalKeys.botInstructionsContext, dispatch),
            fetchReferenceContents(finalKeys.currentUserContext, dispatch),
            fetchReferenceContents(finalKeys.smartReadContext, dispatch),
            fetchReferenceContents(finalKeys.historyContext, dispatch),
            fetchReferenceContents(finalKeys.botKnowledgeContext, dispatch),
          ]);

          const messages = filterAndCleanMessages(selectAllMsgs(state));
          const bodyData = generateRequestBody(agentConfig, messages, {
            botInstructionsContext,
            currentUserContext,
            smartReadContext,
            historyContext,
            botKnowledgeContext,
          });

          await sendCommonChatRequest({
            bodyData,
            cybotConfig: agentConfig,
            thunkApi,
            dialogKey: selectCurrentDialogConfig(state)?.dbKey,
            parentMessageId,
          });
        } catch (error: any) {
          console.error(
            `Error in streamAgentChatTurn for [${args.cybotId}]:`,
            error
          );
          return rejectWithValue(error.message);
        }
      }
    ),
    fetchPubCybots: create.asyncThunk(
      async (
        opts: { limit?: number; sortBy?: SortBy } = {},
        thunkApi: AppThunkApi
      ): Promise<Agent[]> => {
        // 明确 thunk 的返回类型
        const { limit = 20, sortBy = "newest" } = opts;
        const state = thunkApi.getState() as RootState;
        const db = thunkApi.extra.db;
        let localResult: FetchResult;
        try {
          localResult = await fetchLocalCybots({ limit, sortBy, db });
        } catch (err: any) {
          return thunkApi.rejectWithValue(err.message ?? "本地加载失败");
        }

        const server = selectCurrentServer(state);
        if (!server) {
          return localResult.data;
        }

        try {
          const remoteResult = await fetchRemoteCybots(server, limit, sortBy);
          const { merged, toDelete } = mergeCybots(
            localResult.data,
            remoteResult.data
          );
          // 在 thunk 中 dispatch 其他 action 是安全的
          toDelete.forEach((id) =>
            thunkApi.dispatch(remove(pubCybotKeys.item(id)))
          );
          return merged;
        } catch (err: any) {
          // 如果远程获取失败，仍然返回本地数据，并在UI上提示
          console.warn(
            "Remote fetch failed, returning local data:",
            err.message
          );
          return localResult.data;
        }
      }
    ),
  }),
  // ✅ 添加 extraReducers 来处理异步 action 的状态
  extraReducers: (builder) => {
    builder
      .addCase(fetchPubCybots.pending, (state) => {
        state.pubCybots.loading = true;
        state.pubCybots.error = null;
      })
      .addCase(fetchPubCybots.fulfilled, (state, action) => {
        state.pubCybots.loading = false;
        state.pubCybots.data = action.payload;
      })
      .addCase(fetchPubCybots.rejected, (state, action) => {
        state.pubCybots.loading = false;
        state.pubCybots.error =
          (action.payload as string) || action.error.message || "未知错误";
      });
  },
});

export const {
  runLlm,
  streamLlm,
  runAgent,
  streamAgent,
  streamAgentChatTurn,
  fetchPubCybots,
} = cybotSlice.actions;

export default cybotSlice.reducer;
