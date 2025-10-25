// /ai/cybot/cybotSlice.ts

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

// --- [新增导入，用于权限检查] ---
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
          if (!agentConfig) {
            return rejectWithValue(`Agent config not found for ID: ${cybotId}`);
          }

          // ==================================================================
          // ▼▼▼ 在此处执行权限和余额检查 ▼▼▼
          // ==================================================================
          const userBalance = selectCurrentUserBalance(state);
          const currentUserId = selectUserId(state);

          // 检查 1: 余额是否已加载
          if (typeof userBalance !== "number") {
            return rejectWithValue("正在获取用户余额，请稍候...");
          }

          // 检查 2: 白名单 (仅当使用者不是Agent所有者时)
          const isOwner = currentUserId && agentConfig.userId === currentUserId;
          if (!isOwner) {
            const hasWhitelist =
              Array.isArray(agentConfig.whitelist) &&
              agentConfig.whitelist.length > 0;
            if (hasWhitelist) {
              const isUserInWhitelist =
                currentUserId && agentConfig.whitelist.includes(currentUserId);
              if (!isUserInWhitelist) {
                return rejectWithValue("您不在该应用的白名单中，无法使用。");
              }
            }
          }

          // 检查 3: 余额是否充足 (跳过自定义 Provider)
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
          // ▲▲▲ 权限和余额检查结束，若通过则继续执行 ▲▲▲
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
            currentUserMap,
            smartReadMap,
            historyMap,
            botKnowledgeMap,
          ] = await Promise.all([
            fetchReferenceContents(finalKeys.botInstructionsContext, dispatch),
            fetchReferenceContents(finalKeys.currentUserContext, dispatch),
            fetchReferenceContents(finalKeys.smartReadContext, dispatch),
            fetchReferenceContents(finalKeys.historyContext, dispatch),
            fetchReferenceContents(finalKeys.botKnowledgeContext, dispatch),
          ]);

          const pendingFiles = selectPendingFiles(state);
          let formattedCurrentUserContext = "";

          if (pendingFiles.length > 0 && currentUserMap.size > 0) {
            const filesByGroup = new Map<string, PendingFile[]>();
            const relevantPendingFiles = pendingFiles.filter((file) =>
              currentUserMap.has(file.pageKey)
            );

            relevantPendingFiles.forEach((file) => {
              const key = file.groupId || file.id;
              if (!filesByGroup.has(key)) {
                filesByGroup.set(key, []);
              }
              filesByGroup.get(key)!.push(file);
            });

            let sourceCounter = 1;
            filesByGroup.forEach((filesInGroup) => {
              const isGroup = filesInGroup.length > 1;
              const sourceName = isGroup
                ? filesInGroup[0].name.split(" (")[0]
                : filesInGroup[0].name;

              formattedCurrentUserContext += `--- Source ${sourceCounter}: "${sourceName}" ---\n`;

              filesInGroup.forEach((file) => {
                const content = currentUserMap.get(file.pageKey);
                if (content) {
                  if (isGroup) {
                    formattedCurrentUserContext += `### Document: "${file.name}"\n${content}\n`;
                  } else {
                    formattedCurrentUserContext += `${content}\n`;
                  }
                }
              });

              formattedCurrentUserContext += `--- End of Source ${sourceCounter} ---\n\n`;
              sourceCounter++;
            });
          } else {
            formattedCurrentUserContext = Array.from(
              currentUserMap.values()
            ).join("");
          }

          const botInstructionsContext = Array.from(
            botInstructionsMap.values()
          ).join("");
          const smartReadContext = Array.from(smartReadMap.values()).join("");
          const historyContext = Array.from(historyMap.values()).join("");
          const botKnowledgeContext = Array.from(botKnowledgeMap.values()).join(
            ""
          );

          const messages = filterAndCleanMessages(selectAllMsgs(state));
          const bodyData = generateRequestBody({
            agentConfig,
            messages,
            userInput,
            contexts: {
              botInstructionsContext,
              currentUserContext: formattedCurrentUserContext.trim() || null,
              smartReadContext,
              historyContext,
              botKnowledgeContext,
            },
          });

          const currentDialog = selectCurrentDialogConfig(state);
          const dialogKey = currentDialog ? currentDialog.dbKey : undefined;

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

export const { runLlm, streamLlm, runAgent, streamAgent, streamAgentChatTurn } =
  cybotSlice.actions;

export default cybotSlice.reducer;
