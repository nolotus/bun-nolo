import { asyncThunkCreator, buildCreateSlice } from "@reduxjs/toolkit";
import { RootState } from "app/store";
import { read } from "database/dbSlice";
import { generateRequestBody } from "ai/llm/generateRequestBody";
import { fetchReferenceContents } from "ai/context/buildReferenceContext";
import {
  selectCurrentDialogConfig,
  selectPendingFiles,
  PendingFile,
} from "chat/dialog/dialogSlice";
import { selectAllMsgs } from "chat/messages/messageSlice";
import { filterAndCleanMessages } from "integrations/openai/filterAndCleanMessages";
import {
  getFullChatContextKeys,
  deduplicateContextKeys,
} from "ai/agent/getFullChatContextKeys";
import { Agent } from "app/types";
import { _executeModel } from "ai/agent/_executeModel";
import { isResponseAPIModel } from "ai/llm/isResponseAPIModel";

import { selectCurrentUserBalance, selectUserId } from "auth/authSlice";
import { getModelPricing, getPrices, getFinalPrice } from "ai/llm/getPricing";

import { sendOpenAICompletionsRequest } from "../chat/sendOpenAICompletionsRequest";
import { sendOpenAIResponseRequest } from "../chat/sendOpenAIResponseRequest";

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

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

const joinMapValues = (map: Map<string, string>) =>
  Array.from(map.values()).join("");

export const cybotSlice = createSliceWithThunks({
  name: "cybot",
  initialState,
  reducers: (create) => ({
    // 通过 isStreaming 参数控制
    runLlm: create.asyncThunk(
      (
        args: {
          cybotId?: string;
          content: any;
          isStreaming?: boolean;
          parentMessageId?: string;
        },
        thunkApi
      ) =>
        _executeModel(
          {
            isStreaming: args.isStreaming ?? false,
            withAgentContext: false,
            withChatHistory: false,
          },
          args,
          thunkApi
        )
    ),

    // 合并 runAgent 和 streamAgent，通过 isStreaming 参数控制
    runAgent: create.asyncThunk(
      (
        args: {
          cybotId: string;
          content: any;
          isStreaming?: boolean;
          parentMessageId?: string;
        },
        thunkApi
      ) =>
        _executeModel(
          {
            isStreaming: args.isStreaming ?? false,
            withAgentContext: true,
            withChatHistory: false,
          },
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
          if (!agentConfig) {
            return rejectWithValue(`Agent config not found for ID: ${cybotId}`);
          }

          // ==================================================================
          // ▼▼▼ 权限和余额检查 ▼▼▼
          // ==================================================================
          const userBalance = selectCurrentUserBalance(state);
          const currentUserId = selectUserId(state);

          if (typeof userBalance !== "number") {
            return rejectWithValue("正在获取用户余额，请稍候...");
          }

          const isOwner = currentUserId && agentConfig.userId === currentUserId;
          if (!isOwner) {
            const hasWhitelist =
              Array.isArray(agentConfig.whitelist) &&
              agentConfig.whitelist.length > 0;
            if (hasWhitelist) {
              const isUserInWhitelist =
                !!currentUserId &&
                agentConfig.whitelist.includes(currentUserId);
              if (!isUserInWhitelist) {
                return rejectWithValue("您不在该应用的白名单中，无法使用。");
              }
            }
          }

          if (agentConfig.provider !== "Custom") {
            const serverPrices = getModelPricing(
              agentConfig.provider,
              agentConfig.model
            );
            if (!serverPrices) {
              return rejectWithValue("无法获取模型定价信息，请稍后重试。");
            }
            const prices = getPrices(agentConfig, serverPrices);
            const maxPrice = getFinalPrice(prices);
            if (userBalance < maxPrice) {
              return rejectWithValue("余额不足，请充值后再试。");
            }
          }
          // ==================================================================
          // ▲▲▲ 检查结束 ▲▲▲
          // ==================================================================

          const keySets = await getFullChatContextKeys(
            state,
            dispatch,
            agentConfig,
            userInput
          );
          const finalKeys = deduplicateContextKeys(keySets);

          const [
            botInstructionsMap,
            currentInputMap,
            smartReadMap,
            historyMap,
            botKnowledgeMap,
          ] = await Promise.all([
            fetchReferenceContents(finalKeys.botInstructionsContext, dispatch),
            fetchReferenceContents(finalKeys.currentInputContext, dispatch),
            fetchReferenceContents(finalKeys.smartReadContext, dispatch),
            fetchReferenceContents(finalKeys.historyContext, dispatch),
            fetchReferenceContents(finalKeys.botKnowledgeContext, dispatch),
          ]);

          const pendingFiles = selectPendingFiles(state);
          let formattedCurrentInputContext = "";

          if (pendingFiles.length > 0 && currentInputMap.size > 0) {
            // Group pending files by groupId (or fallback to id)
            const filesByGroup = new Map<string, PendingFile[]>();
            const relevantPendingFiles = pendingFiles.filter((file) =>
              currentInputMap.has(file.pageKey)
            );

            for (const file of relevantPendingFiles) {
              const groupKey = file.groupId || file.id;
              const group = filesByGroup.get(groupKey);
              if (group) {
                group.push(file);
              } else {
                filesByGroup.set(groupKey, [file]);
              }
            }

            let sourceCounter = 1;
            filesByGroup.forEach((filesInGroup) => {
              const isGroup = filesInGroup.length > 1;
              const sourceName = isGroup
                ? filesInGroup[0].name.split(" (")[0]
                : filesInGroup[0].name;

              formattedCurrentInputContext += `--- Source ${sourceCounter}: "${sourceName}" ---\n`;

              filesInGroup.forEach((file) => {
                const content = currentInputMap.get(file.pageKey);
                if (!content) return;
                if (isGroup) {
                  formattedCurrentInputContext += `### Document: "${file.name}"\n${content}\n`;
                } else {
                  formattedCurrentInputContext += `${content}\n`;
                }
              });

              formattedCurrentInputContext += `--- End of Source ${sourceCounter} ---\n\n`;
              sourceCounter++;
            });
          } else {
            formattedCurrentInputContext = joinMapValues(currentInputMap);
          }

          const botInstructionsContext = joinMapValues(botInstructionsMap);
          const smartReadContext = joinMapValues(smartReadMap);
          const historyContext = joinMapValues(historyMap);
          const botKnowledgeContext = joinMapValues(botKnowledgeMap);

          const messages = filterAndCleanMessages(selectAllMsgs(state));

          const bodyData = generateRequestBody({
            agentConfig,
            messages,
            userInput,
            contexts: {
              botInstructionsContext,
              currentInputContext: formattedCurrentInputContext.trim() || null,
              smartReadContext,
              historyContext,
              botKnowledgeContext,
            },
          });

          const currentDialog = selectCurrentDialogConfig(state);
          const dialogKey = currentDialog?.dbKey;

          if (!dialogKey) {
            return rejectWithValue("当前对话不存在，无法发送消息。");
          }

          if (isResponseAPIModel(agentConfig)) {
            const logsText = await sendOpenAIResponseRequest({
              bodyData,
              agentConfig,
              thunkApi,
              dialogKey,
              parentMessageId,
            });
            console.log("=== 全量日志 ===\n", logsText);
          } else {
            await sendOpenAICompletionsRequest({
              bodyData,
              cybotConfig: agentConfig,
              thunkApi,
              dialogKey,
              parentMessageId,
            });
          }
        } catch (error: any) {
          console.error(
            `Error in streamAgentChatTurn for [${args.cybotId}]:`,
            error
          );
          return rejectWithValue(
            error.message ||
              "An unexpected error occurred in streamAgentChatTurn."
          );
        }
      }
    ),
  }),
});

export const { runLlm, runAgent, streamAgentChatTurn } = cybotSlice.actions;

export default cybotSlice.reducer;
