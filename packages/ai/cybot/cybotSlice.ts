// /ai/cybot/cybotSlice.ts

import { asyncThunkCreator, buildCreateSlice } from "@reduxjs/toolkit";
import { RootState } from "app/store";
import { read } from "database/dbSlice";
import { generateRequestBody } from "ai/llm/generateRequestBody";
import { fetchReferenceContents } from "ai/context/buildReferenceContext";
// <--- 改动 1: 导入 PendingFile 类型和 selectPendingFiles 选择器
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

          // <--- 核心改动开始 ---

          // 1. 获取当前待处理的文件附件
          const pendingFiles = selectPendingFiles(state);
          let formattedCurrentUserContext = "";

          // 2. 仅当存在待处理文件且内容已获取时，才进行分组处理
          if (pendingFiles.length > 0 && currentUserMap.size > 0) {
            const filesByGroup = new Map<string, PendingFile[]>();

            // 筛选出那些内容确实被加载了的 pendingFiles
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
                  // 如果是分组的，添加 Document 标题，否则直接附加内容
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
            // 如果没有待处理文件，则维持原有行为，简单拼接所有内容
            formattedCurrentUserContext = Array.from(
              currentUserMap.values()
            ).join("");
          }

          // 3. 将其他上下文的 Map 转换回字符串以保持对下游的兼容性
          const botInstructionsContext = Array.from(
            botInstructionsMap.values()
          ).join("");
          const smartReadContext = Array.from(smartReadMap.values()).join("");
          const historyContext = Array.from(historyMap.values()).join("");
          const botKnowledgeContext = Array.from(botKnowledgeMap.values()).join(
            ""
          );

          // <--- 核心改动结束 ---

          const messages = filterAndCleanMessages(selectAllMsgs(state));
          const bodyData = generateRequestBody({
            agentConfig,
            messages,
            userInput,
            contexts: {
              botInstructionsContext,
              currentUserContext: formattedCurrentUserContext.trim() || null, // 使用新变量, 并确保空字符串转为null
              smartReadContext,
              historyContext,
              botKnowledgeContext,
            },
          });

          if (isResponseAPIModel(agentConfig)) {
            const logsText = await sendOpenAIResponseRequest({
              bodyData,
              agentConfig,
              thunkApi,
              dialogKey: selectCurrentDialogConfig(state)?.dbKey,
              parentMessageId,
            });

            console.log("=== 全量日志 ===\n", logsText);
          } else {
            await sendOpenAICompletionsRequest({
              bodyData,
              cybotConfig: agentConfig,
              thunkApi,
              dialogKey: selectCurrentDialogConfig(state)?.dbKey,
              parentMessageId,
            });
          }
        } catch (error: any) {
          console.error(
            `Error in streamAgentChatTurn for [${args.cybotId}]:`,
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
