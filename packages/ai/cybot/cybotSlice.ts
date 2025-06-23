// /ai/cybot/cybotSlice.ts

import {
  asyncThunkCreator,
  buildCreateSlice,
  AsyncThunk,
} from "@reduxjs/toolkit";
import * as R from "rambda";
import { read } from "database/dbSlice";
import { selectCurrentServer } from "setting/settingSlice";
import { getApiEndpoint } from "ai/llm/providers";
import { performFetchRequest } from "../chat/fetchUtils";
import { generateRequestBody } from "ai/llm/generateRequestBody";
import { fetchReferenceContents } from "ai/context/buildReferenceContext";
import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";
import { selectAllMsgs } from "chat/messages/messageSlice";
import { contextCybotId } from "core/init";
import { formatDataForApi } from "./formatDataForApi";
import { selectCurrentSpace } from "create/space/spaceSlice";
import { selectCurrentToken } from "auth/authSlice";
import { sendCommonChatRequest } from "../chat/sendCommonRequest";
import { RootState } from "app/store";
import { Message } from "integrations/openai/generateRequestBody";
import { filterAndCleanMessages } from "integrations/openai/filterAndCleanMessages";

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

// --- 内部核心执行函数 ---

/**
 * 内部核心模型执行器。
 * @param options - 配置：是否流式，是否带Agent上下文，是否带聊天历史
 * @param args - 来自 thunk 的参数
 * @param thunkApi - Redux Thunk API
 */
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
  const { cybotId: providedCybotId, content, parentMessageId } = args;
  const { getState, dispatch, rejectWithValue } = thunkApi;
  const state = getState();

  const cybotId =
    providedCybotId || selectCurrentDialogConfig(state)?.cybots?.[0];
  if (!cybotId) {
    const errorMsg = `Model execution failed: No cybotId provided or found.`;
    console.error(errorMsg);
    return rejectWithValue(errorMsg);
  }

  try {
    const agentConfig = await dispatch(read(cybotId)).unwrap();
    let agentContexts = {};
    let messages: Message[] = [];

    // 步骤 1: 准备 Agent 上下文 (如果需要)
    if (withAgentContext) {
      const botInstructionKeys = new Set<string>();
      const botKnowledgeKeys = new Set<string>();
      if (Array.isArray(agentConfig.references)) {
        agentConfig.references.forEach(
          (ref: { dbKey: string; type: string }) => {
            if (ref && ref.dbKey) {
              if (ref.type === "instruction") botInstructionKeys.add(ref.dbKey);
              else botKnowledgeKeys.add(ref.dbKey);
            }
          }
        );
      }
      const [botInstructionsContext, botKnowledgeContext] = await Promise.all([
        fetchReferenceContents(Array.from(botInstructionKeys), dispatch),
        fetchReferenceContents(Array.from(botKnowledgeKeys), dispatch),
      ]);
      agentContexts = { botInstructionsContext, botKnowledgeContext };
    }

    // 步骤 2: 准备消息列表
    if (withChatHistory) {
      messages = filterAndCleanMessages(selectAllMsgs(state));
      // 对于完整的聊天回合，当前用户输入也应被视为消息的一部分
      messages.push({ role: "user", content });
    } else {
      // 对于 Llm 和 Agent 调用，只包含当前任务作为用户消息
      messages = [{ role: "user", content }];
    }

    // 步骤 3: 生成请求体
    const bodyData = generateRequestBody(agentConfig, messages, agentContexts);
    bodyData.stream = isStreaming;

    // 步骤 4: 执行请求
    if (isStreaming) {
      await sendCommonChatRequest({
        bodyData,
        cybotConfig: agentConfig,
        thunkApi,
        dialogKey: selectCurrentDialogConfig(state)?.dbKey,
        parentMessageId,
      });
      // 流式调用不返回内容
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

// --- 辅助函数 (仅用于 streamAgentChatTurn 的复杂上下文收集) ---

const getFullChatContextKeys = async (
  state: RootState,
  dispatch: any,
  agentConfig: any,
  userInput: string | any[]
): Promise<Record<string, Set<string>>> => {
  const msgs = selectAllMsgs(state);
  const botInstructionKeys = new Set<string>();
  const botKnowledgeKeys = new Set<string>();
  if (Array.isArray(agentConfig.references)) {
    agentConfig.references.forEach((ref: { dbKey: string; type: string }) => {
      if (ref?.dbKey) {
        if (ref.type === "instruction") botInstructionKeys.add(ref.dbKey);
        else botKnowledgeKeys.add(ref.dbKey);
      }
    });
  }
  const currentUserKeys = new Set<string>();
  if (Array.isArray(userInput)) {
    userInput.forEach(
      (part: any) => part?.pageKey && currentUserKeys.add(part.pageKey)
    );
  }
  const smartReadKeys = new Set<string>();
  if (agentConfig.smartReadEnabled === true) {
    const spaceData = selectCurrentSpace(state);
    const formattedData = formatDataForApi(spaceData, msgs);
    try {
      const outputReference = await dispatch(
        (cybotSlice.actions.runLlm as AsyncThunk<any, any, any>)({
          cybotId: contextCybotId,
          content: `User Input: 请提取相关内容的 contentKey ID\n\n${formattedData}`,
        })
      ).unwrap();
      const cleanedOutput = outputReference.replace(/```json|```/g, "").trim();
      if (cleanedOutput) {
        const parsedKeys = JSON.parse(cleanedOutput);
        if (Array.isArray(parsedKeys)) {
          parsedKeys.forEach(
            (key) => typeof key === "string" && smartReadKeys.add(key)
          );
        }
      }
    } catch (error) {
      console.error(
        "getFullChatContextKeys - Failed to parse smartRead output:",
        error
      );
    }
  }
  const historyKeys = new Set<string>();
  msgs.forEach((msg: any) => {
    const content = Array.isArray(msg.content) ? msg.content : [msg.content];
    content.forEach(
      (part: any) => part?.pageKey && historyKeys.add(part.pageKey)
    );
  });
  return {
    botInstructionKeys,
    currentUserKeys,
    smartReadKeys,
    historyKeys,
    botKnowledgeKeys,
  };
};

const deduplicateContextKeys = (
  keys: Record<string, Set<string>>
): Record<string, string[]> => {
  const {
    botInstructionKeys,
    currentUserKeys,
    smartReadKeys,
    historyKeys,
    botKnowledgeKeys,
  } = keys;
  const finalBotInstructionKeys = Array.from(botInstructionKeys);
  const finalCurrentUserKeys = R.difference(
    Array.from(currentUserKeys),
    finalBotInstructionKeys
  );
  const finalSmartReadKeys = R.difference(Array.from(smartReadKeys), [
    ...finalBotInstructionKeys,
    ...finalCurrentUserKeys,
  ]);
  const finalHistoryKeys = R.difference(Array.from(historyKeys), [
    ...finalBotInstructionKeys,
    ...finalCurrentUserKeys,
    ...finalSmartReadKeys,
  ]);
  const finalBotKnowledgeKeys = R.difference(Array.from(botKnowledgeKeys), [
    ...finalBotInstructionKeys,
    ...finalCurrentUserKeys,
    ...finalSmartReadKeys,
    ...finalHistoryKeys,
  ]);
  return {
    botInstructionsContext: finalBotInstructionKeys,
    currentUserContext: finalCurrentUserKeys,
    smartReadContext: finalSmartReadKeys,
    historyContext: finalHistoryKeys,
    botKnowledgeContext: finalBotKnowledgeKeys,
  };
};

// --- Slice Definition ---

const initialState = {};

export const cybotSlice = createSliceWithThunks({
  name: "cybot",
  initialState,
  reducers: (create) => ({
    // TIER 1: LLM (无上下文, 无历史)
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

    // TIER 2: Agent (有上下文, 无历史)
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

    // TIER 3: Chat (有所有上下文, 有历史) - 逻辑复杂，保持独立
    streamAgentChatTurn: create.asyncThunk(
      async (
        args: {
          cybotId: string;
          userInput: string | any[];
          parentMessageId?: string;
        },
        thunkApi
      ) => {
        const { cybotId, userInput, parentMessageId } = args;
        const { getState, dispatch, rejectWithValue } = thunkApi;
        try {
          const state = getState();
          const agentConfig = await dispatch(read(cybotId)).unwrap();

          const keySets = await getFullChatContextKeys(
            state,
            dispatch,
            agentConfig,
            userInput
          );
          const finalKeyArrays = deduplicateContextKeys(keySets);

          const [
            botInstructionsContext,
            currentUserContext,
            smartReadContext,
            historyContext,
            botKnowledgeContext,
          ] = await Promise.all([
            fetchReferenceContents(
              finalKeyArrays.botInstructionsContext,
              dispatch
            ),
            fetchReferenceContents(finalKeyArrays.currentUserContext, dispatch),
            fetchReferenceContents(finalKeyArrays.smartReadContext, dispatch),
            fetchReferenceContents(finalKeyArrays.historyContext, dispatch),
            fetchReferenceContents(
              finalKeyArrays.botKnowledgeContext,
              dispatch
            ),
          ]);

          const finalContexts = {
            botInstructionsContext,
            currentUserContext,
            smartReadContext,
            historyContext,
            botKnowledgeContext,
          };

          const messages = filterAndCleanMessages(selectAllMsgs(state));
          console.log("streamAgentChatTurn - messages:", messages);
          // `sendCommonChatRequest` 会处理新用户消息的创建，这里我们只需要历史和上下文

          const bodyData = generateRequestBody(
            agentConfig,
            messages,
            finalContexts
          );

          await sendCommonChatRequest({
            bodyData,
            cybotConfig: agentConfig,
            thunkApi,
            dialogKey: selectCurrentDialogConfig(state)?.dbKey,
            parentMessageId,
          });
        } catch (error: any) {
          console.error(
            `Error in streamAgentChatTurn for [${cybotId}]:`,
            error
          );
          return rejectWithValue(error.message);
        }
      }
    ),
  }),
});

export const { runLlm, streamLlm, runAgent, streamAgent, streamAgentChatTurn } =
  cybotSlice.actions;

export default cybotSlice.reducer;
