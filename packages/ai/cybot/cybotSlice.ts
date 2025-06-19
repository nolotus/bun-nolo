// /ai/cybot/cybotSlice.ts (完整、最终版本)

import {
  asyncThunkCreator,
  buildCreateSlice,
  AsyncThunk,
} from "@reduxjs/toolkit";
import { DataType } from "create/types";
import { read } from "database/dbSlice";
import { selectCurrentServer } from "setting/settingSlice";
import { getApiEndpoint } from "ai/llm/providers";
import { performFetchRequest } from "../chat/fetchUtils";
import { generateRequestBody } from "./generateRequestBody";
import { fetchReferenceContents } from "ai/context/buildReferenceContext";
import { requestHandlers } from "ai/llm/providers";
import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";
import { selectAllMsgs } from "chat/messages/messageSlice";
import { contextCybotId } from "core/init";
import { formatDataForApi } from "./formatDataForApi";
import { selectCurrentSpace } from "create/space/spaceSlice";
import { selectCurrentToken } from "auth/authSlice";

// 创建带有 Thunk 的 Slice
const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

// 初始化状态
const initialState = {
  // 初始化状态
};

// 创建 cybot Slice
export const cybotSlice = createSliceWithThunks({
  name: "cybot",
  initialState: initialState,
  reducers: (create) => ({
    /**
     * 运行 Cybot ID，执行非流式请求以获取内容结果
     */
    runCybotId: create.asyncThunk(async ({ cybotId, content }, thunkApi) => {
      const state = thunkApi.getState();
      const dispatch = thunkApi.dispatch;
      const cybotConfig = await dispatch(read(cybotId)).unwrap();
      if (cybotConfig.type === DataType.CYBOT) {
        const api = getApiEndpoint(cybotConfig);
        const currentServer = selectCurrentServer(state);
        const messages = [
          {
            role: "system",
            content: cybotConfig.prompt,
          },
          { role: "user", content }, // 使用 content 参数，供系统构造后传入
        ];
        const bodyData = { model: cybotConfig.model, messages, stream: false };
        const token = selectCurrentToken(state);
        const response = await performFetchRequest({
          cybotConfig,
          api,
          bodyData,
          currentServer,
          token,
        });

        const result = await response.json();
        const contentResult = result.choices[0].message.content;
        return contentResult;
      }
      return null;
    }, {}),

    /**
     * 流式运行 Cybot ID，处理用户输入并与 AI 进行交互
     */
    streamCybotId: create.asyncThunk(
      // ✨ 关键 1: 修改 Thunk 的参数类型，使其可以接收可选的 parentMessageId ✨
      async (
        args: {
          cybotId: string;
          userInput: string | any[]; // 保持原有类型
          parentMessageId?: string; // 新增可选参数
        },
        thunkApi
      ) => {
        const { cybotId, userInput, parentMessageId } = args; // 解构出新参数
        const { getState, dispatch, rejectWithValue } = thunkApi; // 使用完整的 thunkApi
        const state = getState();
        const msgs = selectAllMsgs(state);

        try {
          const cybotConfig = await dispatch(read(cybotId)).unwrap();

          // --- 1. 收集所有来源的 Keys，并按类型分离 (逻辑不变) ---

          const currentUserKeys = new Set<string>();
          if (Array.isArray(userInput)) {
            userInput.forEach((part: any) => {
              if (part && part.pageKey) currentUserKeys.add(part.pageKey);
            });
          }

          const smartReadKeys = new Set<string>();
          if (cybotConfig.smartReadEnabled === true) {
            const spaceData = selectCurrentSpace(state);
            const formattedData = formatDataForApi(spaceData, msgs);
            const outputReference = await dispatch(
              (cybotSlice.actions.runCybotId as AsyncThunk<any, any, any>)({
                cybotId: contextCybotId,
                content: `User Input: 请提取相关内容的 contentKey ID\n\n${formattedData}`,
              })
            ).unwrap();

            try {
              const cleanedOutput = outputReference
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();
              if (cleanedOutput) {
                const parsedKeys = JSON.parse(cleanedOutput);
                if (Array.isArray(parsedKeys)) {
                  parsedKeys.forEach((key) => {
                    if (typeof key === "string") smartReadKeys.add(key);
                  });
                }
              }
            } catch (error) {
              console.error(
                "streamCybotId - Failed to parse smartRead output:",
                outputReference,
                error
              );
            }
          }

          const historyKeys = new Set<string>();
          msgs.forEach((msg: any) => {
            const content = Array.isArray(msg.content)
              ? msg.content
              : [msg.content];
            content.forEach((part: any) => {
              if (part && part.pageKey) historyKeys.add(part.pageKey);
            });
          });

          const botInstructionKeys = new Set<string>();
          const botKnowledgeKeys = new Set<string>();
          if (Array.isArray(cybotConfig.references)) {
            cybotConfig.references.forEach(
              (ref: { dbKey: string; type: string }) => {
                if (ref && ref.dbKey) {
                  if (ref.type === "instruction") {
                    botInstructionKeys.add(ref.dbKey);
                  } else {
                    botKnowledgeKeys.add(ref.dbKey);
                  }
                }
              }
            );
          }

          // --- 2. 按优先级去重 (逻辑不变) ---
          currentUserKeys.forEach((key) => {
            if (botInstructionKeys.has(key)) currentUserKeys.delete(key);
          });
          smartReadKeys.forEach((key) => {
            if (botInstructionKeys.has(key) || currentUserKeys.has(key))
              smartReadKeys.delete(key);
          });
          historyKeys.forEach((key) => {
            if (
              botInstructionKeys.has(key) ||
              currentUserKeys.has(key) ||
              smartReadKeys.has(key)
            )
              historyKeys.delete(key);
          });
          botKnowledgeKeys.forEach((key) => {
            if (
              botInstructionKeys.has(key) ||
              currentUserKeys.has(key) ||
              smartReadKeys.has(key) ||
              historyKeys.has(key)
            )
              botKnowledgeKeys.delete(key);
          });

          // --- 3. 并发获取每个层级的内容 (逻辑不变) ---
          const [
            botInstructionsContext,
            currentUserContext,
            smartReadContext,
            historyContext,
            botKnowledgeContext,
          ] = await Promise.all([
            fetchReferenceContents(Array.from(botInstructionKeys), dispatch),
            fetchReferenceContents(Array.from(currentUserKeys), dispatch),
            fetchReferenceContents(Array.from(smartReadKeys), dispatch),
            fetchReferenceContents(Array.from(historyKeys), dispatch),
            fetchReferenceContents(Array.from(botKnowledgeKeys), dispatch),
          ]);
          // --- 4. 将所有结构化上下文传递给请求体生成器 (逻辑不变) ---
          const providerName = cybotConfig.provider.toLowerCase();
          const bodyData = generateRequestBody(state, cybotConfig, {
            botInstructionsContext,
            currentUserContext,
            smartReadContext,
            historyContext,
            botKnowledgeContext,
          });

          // --- 5. 执行请求 ---
          const handler = requestHandlers[providerName];
          if (!handler) {
            throw new Error(
              `No request handler found for provider: ${providerName}`
            );
          }
          const dialogConfig = selectCurrentDialogConfig(state);
          const dialogKey = dialogConfig?.dbKey; // 使用可选链，因为 dialogConfig 可能为 null

          // ✨ 关键 2: 将 parentMessageId 传递给最终的请求处理器 ✨
          await handler({
            bodyData,
            cybotConfig,
            thunkApi,
            dialogKey,
            // 如果 parentMessageId 存在，就用它；否则，让 handler 自己生成。
            // 这使得同一个 handler 既可以用于创建新消息，也可以用于“变形”现有消息。
            parentMessageId: parentMessageId,
          });
        } catch (error: any) {
          console.error(`执行 Cybot [${cybotId}] 时出错:`, error);
          return rejectWithValue(error.message);
        }
      },
      {}
    ),
  }),
});

// 导出 actions 和 reducer
export const { runCybotId, streamCybotId } = cybotSlice.actions;
export default cybotSlice.reducer;
