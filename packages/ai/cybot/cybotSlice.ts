// /ai/cybot/cybotSlice.ts

import { asyncThunkCreator, buildCreateSlice } from "@reduxjs/toolkit";
import { AppThunkApi, RootState } from "app/store";
import { selectCurrentToken } from "auth/authSlice";
import { read, remove } from "database/dbSlice";
import { pubCybotKeys } from "database/keys";
import { selectCurrentServer } from "app/settings/settingSlice";
import { getApiEndpoint } from "ai/llm/providers";
import { performFetchRequest } from "../chat/fetchUtils";
import { generateRequestBody } from "ai/llm/generateRequestBody";
import { fetchReferenceContents } from "ai/context/buildReferenceContext";
import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";
import { selectAllMsgs } from "chat/messages/messageSlice";
import { sendCommonChatRequest } from "../chat/sendCommonRequest";
import { Message } from "integrations/openai/generateRequestBody";
import { filterAndCleanMessages } from "integrations/openai/filterAndCleanMessages";
import { fetchAgentContexts } from "ai/agent/fetchAgentContexts";
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
const _executeModel = async (
  options: {
    isStreaming: boolean;
    withAgentContext: boolean;
    withChatHistory: boolean;
  },
  args: { cybotId?: string; content: any; parentMessageId?: string },
  thunkApi: any
) => {
  const { isStreaming, withAgentContext, withChatHistory } = options;
  const { getState, dispatch, rejectWithValue } = thunkApi;
  const state = getState() as RootState;

  const cybotId = args.cybotId || selectCurrentDialogConfig(state)?.cybots?.[0];
  if (!cybotId) {
    const msg = "Model execution failed: No cybotId provided or found.";
    console.error(msg);
    return rejectWithValue(msg);
  }

  try {
    const agentConfig = await dispatch(read(cybotId)).unwrap();
    const agentContexts = withAgentContext
      ? await fetchAgentContexts(agentConfig.references, dispatch)
      : {};

    let messages: Message[];
    if (withChatHistory) {
      messages = filterAndCleanMessages(selectAllMsgs(state));
      messages.push({ role: "user", content: args.content });
    } else {
      messages = [{ role: "user", content: args.content }];
    }

    const bodyData = generateRequestBody(agentConfig, messages, agentContexts);
    bodyData.stream = isStreaming;

    if (isStreaming) {
      await sendCommonChatRequest({
        bodyData,
        cybotConfig: agentConfig,
        thunkApi,
        dialogKey: selectCurrentDialogConfig(state)?.dbKey,
        parentMessageId: args.parentMessageId,
      });
    } else {
      const response = await performFetchRequest({
        cybotConfig: agentConfig,
        api: getApiEndpoint(agentConfig),
        bodyData,
        currentServer: selectCurrentServer(state),
        token: selectCurrentToken(state),
      });
      const result = await response.json();
      return result.choices[0].message.content;
    }
  } catch (error: any) {
    console.error(`_executeModel failed for cybot [${cybotId}]`, error);
    return rejectWithValue(error.message);
  }
};

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
} = {}): Promise<FetchResult> {
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
            : a.createdAt;
        const tb =
          typeof b.createdAt === "string"
            ? Date.parse(b.createdAt)
            : b.createdAt;
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
    if (remoteIds.has(bot.id)) merged.push(bot);
    else toDelete.push(bot.id);
  });

  remoteData.forEach((bot) => {
    if (!merged.some((b) => b.id === bot.id)) merged.push(bot);
  });

  merged.sort((a, b) => {
    const ta =
      typeof a.createdAt === "string" ? Date.parse(a.createdAt) : a.createdAt;
    const tb =
      typeof b.createdAt === "string" ? Date.parse(b.createdAt) : b.createdAt;
    return tb - ta;
  });

  return { merged, toDelete };
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
      ) => {
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
          toDelete.forEach((id) => thunkApi.dispatch(remove(id)));
          return merged;
        } catch {
          return localResult.data;
        }
      }
    ),
  }),
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
