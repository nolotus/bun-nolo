// /ai/cybot/cybotSlice.ts

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
import { sendCommonChatRequest } from "../chat/sendCommonRequest";

const createSliceWithThunks = buildCreateSlice({
  creators: { asyncThunk: asyncThunkCreator },
});

const initialState = {};

export const cybotSlice = createSliceWithThunks({
  name: "cybot",
  initialState: initialState,
  reducers: (create) => ({
    runCybotId: create.asyncThunk(async ({ cybotId, content }, thunkApi) => {
      const state = thunkApi.getState();
      const dispatch = thunkApi.dispatch;
      const cybotConfig = await dispatch(read(cybotId)).unwrap();

      const api = getApiEndpoint(cybotConfig);
      const currentServer = selectCurrentServer(state);
      const messages = [
        { role: "system", content: cybotConfig.prompt },
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
      return result.choices[0].message.content;
    }, {}),

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
          const agentConfig = await dispatch(read(cybotId)).unwrap();

          // --- 1. 完整上下文收集 ---
          // (不再有继承逻辑，每次都从头开始收集)
          const currentUserKeys = new Set<string>();
          if (Array.isArray(userInput)) {
            userInput.forEach((part: any) => {
              if (part && part.pageKey) currentUserKeys.add(part.pageKey);
            });
          }

          const smartReadKeys = new Set<string>();
          if (agentConfig.smartReadEnabled === true) {
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
                .replace(/```json|```/g, "")
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
          if (Array.isArray(agentConfig.references)) {
            agentConfig.references.forEach(
              (ref: { dbKey: string; type: string }) => {
                if (ref && ref.dbKey) {
                  if (ref.type === "instruction")
                    botInstructionKeys.add(ref.dbKey);
                  else botKnowledgeKeys.add(ref.dbKey);
                }
              }
            );
          }

          // --- 2. 优先级去重 (无变化) ---
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

          // --- 3. 并发获取上下文内容 (无变化) ---
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

          const finalContexts = {
            botInstructionsContext,
            currentUserContext,
            smartReadContext,
            historyContext,
            botKnowledgeContext,
          };

          // --- 4. 构建请求体 ---
          const bodyData = generateRequestBody(
            state,
            agentConfig,
            finalContexts,
            userInput
          );
          const dialogConfig = selectCurrentDialogConfig(state);
          const dialogKey = dialogConfig?.dbKey;

          await sendCommonChatRequest({
            bodyData,
            cybotConfig: agentConfig,
            thunkApi,
            dialogKey,
            parentMessageId,
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

export const { runCybotId, streamCybotId } = cybotSlice.actions;
export default cybotSlice.reducer;
