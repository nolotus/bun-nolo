// /ai/cybot/cybotSlice.ts

import { asyncThunkCreator, buildCreateSlice } from "@reduxjs/toolkit";
import { RootState } from "app/store";
import { read } from "database/dbSlice";
import { generateRequestBody } from "ai/llm/generateRequestBody";
import { fetchReferenceContents } from "ai/context/buildReferenceContext";
import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";
import { selectAllMsgs } from "chat/messages/messageSlice";
import { filterAndCleanMessages } from "integrations/openai/filterAndCleanMessages";
import {
  getFullChatContextKeys,
  deduplicateContextKeys,
} from "ai/agent/getFullChatContextKeys";
import { Agent } from "app/types";
import { _executeModel } from "ai/agent/_executeModel";

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
          const bodyData = generateRequestBody({
            agentConfig,
            messages,
            userInput,
            contexts: {
              botInstructionsContext,
              currentUserContext,
              smartReadContext,
              historyContext,
              botKnowledgeContext,
            },
          });
          console.log("bodyData", bodyData);
          const isResponseAPIModel =
            agentConfig.model === "o3-pro" || agentConfig.model === "o4-mini";
          if (agentConfig.provider === "openai" && isResponseAPIModel) {
            await sendOpenAIResponseRequest({
              bodyData,
              agentConfig,
              thunkApi,
              dialogKey: selectCurrentDialogConfig(state)?.dbKey,
              parentMessageId,
            });
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
