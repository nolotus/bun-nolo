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
import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";
import { selectAllMsgs } from "chat/messages/messageSlice";
import { contextCybotId } from "core/init";
import { formatDataForApi } from "./formatDataForApi";
import { selectCurrentSpace } from "create/space/spaceSlice";
import { selectCurrentToken } from "auth/authSlice";
import { parseApiError } from "ai/chat/parseApiError";
import { sendCommonChatRequest } from "../chat/sendCommonRequest";
// 创建带有 Thunk 的 Slice
const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

// 初始化状态
const initialState = {
  // 可以根据需要添加状态，例如记录当前正在运行的cybot等
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
          { role: "user", content },
        ];
        const bodyData = {
          model: cybotConfig.model,
          messages,
          stream: false,
        };
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
        const state = getState();
        const msgs = selectAllMsgs(state);

        try {
          const cybotConfig = await dispatch(read(cybotId)).unwrap();

          // --- 1. 上下文收集 ---
          // (根据您的上下文策略进行调整，此处为完整收集逻辑)
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

          // --- 2. 优先级去重 ---
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

          // --- 3. 并发获取上下文内容 ---
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

          const contexts = {
            botInstructionsContext,
            currentUserContext,
            smartReadContext,
            historyContext,
            botKnowledgeContext,
          };

          // --- 4. 构建请求体 ---
          const bodyData = generateRequestBody(state, cybotConfig, contexts);

          const dialogConfig = selectCurrentDialogConfig(state);
          const dialogKey = dialogConfig?.dbKey;

          await sendCommonChatRequest({
            bodyData,
            cybotConfig,
            thunkApi,
            dialogKey,
            parentMessageId: parentMessageId,
            inheritedContext: contexts, // 传递完整的上下文给 handler
          });
        } catch (error: any) {
          console.error(`执行 Cybot [${cybotId}] 时出错:`, error);
          return rejectWithValue(error.message);
        }
      },
      {}
    ),

    /**
     * 作为 Agent 被启动，并返回一个新的流读取器 (Reader) 和配置。
     * 这个 Thunk 执行 Agent 的启动逻辑，并返回关键对象给调用方。
     */
    initiateAgentStream: create.asyncThunk(
      async (
        args: {
          agentKey: string;
          userInput: string | any[];
        },
        thunkApi
      ) => {
        const { agentKey, userInput } = args;
        const { getState, dispatch, signal, rejectWithValue } = thunkApi;

        try {
          const newCybotConfig = await dispatch(read(agentKey)).unwrap();

          // 获取新 Agent 自身的上下文
          const newBotInstructionKeys: string[] = [];
          const newBotKnowledgeKeys: string[] = [];
          if (Array.isArray(newCybotConfig.references)) {
            newCybotConfig.references.forEach(
              (ref: { dbKey: string; type: string }) => {
                if (ref && ref.dbKey) {
                  if (ref.type === "instruction") {
                    newBotInstructionKeys.push(ref.dbKey);
                  } else {
                    newBotKnowledgeKeys.push(ref.dbKey);
                  }
                }
              }
            );
          }
          const [newBotInstructionsContext, newBotKnowledgeContext] =
            await Promise.all([
              fetchReferenceContents(newBotInstructionKeys, dispatch),
              fetchReferenceContents(newBotKnowledgeKeys, dispatch),
            ]);

          // 融合继承的上下文和新 Agent 的上下文
          const finalContext = {
            botInstructionsContext: [newBotInstructionsContext]
              .filter(Boolean)
              .join("\n\n"),
            botKnowledgeContext: [newBotKnowledgeContext]
              .filter(Boolean)
              .join("\n\n"),
          };

          // 根据新 Agent 的配置和融合后的上下文生成请求体
          const bodyData = generateRequestBody(
            getState(),
            newCybotConfig,
            finalContext
          );

          const api = getApiEndpoint(newCybotConfig);
          const token = selectCurrentToken(getState());
          const currentServer = selectCurrentServer(getState());

          const response = await performFetchRequest({
            cybotConfig: newCybotConfig,
            api,
            bodyData,
            currentServer,
            signal,
            token,
          });

          if (!response.ok || !response.body) {
            const errorMsg = await parseApiError(response);
            throw new Error(`Agent [${agentKey}] request failed: ${errorMsg}`);
          }

          console.log(`Switching stream to agent: ${agentKey}`);

          // Thunk 的成功返回值
          return {
            newReader: response.body.getReader(),
            newCybotConfig: newCybotConfig,
          };
        } catch (error: any) {
          console.error(
            `Failed to initiate agent stream for [${agentKey}]:`,
            error
          );
          return rejectWithValue(error.message);
        }
      },
      {}
    ),
  }),
});

// 导出 actions 和 reducer
export const { runCybotId, streamCybotId, initiateAgentStream } =
  cybotSlice.actions;
export default cybotSlice.reducer;
