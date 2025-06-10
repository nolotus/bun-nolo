import { asyncThunkCreator, buildCreateSlice } from "@reduxjs/toolkit";
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
      async ({ cybotId, userInput }, thunkApi) => {
        const state = thunkApi.getState();
        const msgs = selectAllMsgs(state);
        const dispatch = thunkApi.dispatch;
        const cybotConfig = await dispatch(read(cybotId)).unwrap();

        // --- 1. 收集所有来源的 Keys，并按类型分离 ---

        // 源 1: 用户当前输入中引用的 Key (高优先级)
        const currentUserKeys = new Set<string>();
        if (Array.isArray(userInput)) {
          userInput.forEach((part: any) => {
            if (part && part.pageKey) currentUserKeys.add(part.pageKey);
          });
        }

        // 源 2: 智能读取 (中高优先级)
        const smartReadKeys = new Set<string>();
        if (cybotConfig.smartReadEnabled === true) {
          const spaceData = selectCurrentSpace(state);
          const formattedData = formatDataForApi(spaceData, msgs);
          const outputReference = await dispatch(
            runCybotId({
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

        // 源 3: 对话历史 (中等优先级)
        const historyKeys = new Set<string>();
        msgs.forEach((msg: any) => {
          const content = Array.isArray(msg.content)
            ? msg.content
            : [msg.content];
          content.forEach((part: any) => {
            if (part && part.pageKey) historyKeys.add(part.pageKey);
          });
        });

        // 源 4: 从预设参考资料中分离 "指令" 和 "知识"
        const botInstructionKeys = new Set<string>();
        const botKnowledgeKeys = new Set<string>();
        if (Array.isArray(cybotConfig.references)) {
          cybotConfig.references.forEach(
            (ref: { dbKey: string; type: string }) => {
              if (ref && ref.dbKey) {
                if (ref.type === "instruction") {
                  botInstructionKeys.add(ref.dbKey);
                } else {
                  // 默认为 knowledge
                  botKnowledgeKeys.add(ref.dbKey);
                }
              }
            }
          );
        }

        // --- 2. 按优先级去重 ---
        // 优先级: Core Prompt (隐式) > Instructions > CurrentUser > SmartRead > History > Knowledge
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

        // --- 3. 并发获取每个层级的内容 ---
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
        // --- 4. 将所有结构化上下文传递给请求体生成器 ---
        const providerName = cybotConfig.provider.toLowerCase();
        const bodyData = generateRequestBody(
          state,
          cybotConfig, // cybotConfig 中包含了核心 prompt
          {
            botInstructionsContext,
            currentUserContext,
            smartReadContext,
            historyContext,
            botKnowledgeContext,
          }
        );

        // --- 5. 执行请求 ---
        const handler = requestHandlers[providerName];
        if (!handler) {
          throw new Error(
            `No request handler found for provider: ${providerName}`
          );
        }
        const dialogConfig = selectCurrentDialogConfig(state);
        const dialogKey = dialogConfig.dbKey;

        await handler({
          bodyData,
          cybotConfig,
          thunkApi,
          dialogKey,
        });
      },
      {}
    ),
  }),
});

// 导出 actions 和 reducer
export const { runCybotId, streamCybotId } = cybotSlice.actions;
export default cybotSlice.reducer;
