import { RootState } from "app/store";
import { Message } from "app/types";
import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";
import { read } from "database/dbSlice";
import { fetchAgentContexts } from "ai/agent/fetchAgentContexts";
import { filterAndCleanMessages } from "integrations/openai/filterAndCleanMessages";
import { selectAllMsgs } from "chat/messages/messageSlice";
import { generateRequestBody } from "ai/llm/generateRequestBody";
import { getApiEndpoint } from "ai/llm/providers";
import { selectCurrentServer } from "app/settings/settingSlice";
import { selectCurrentToken } from "auth/authSlice";

import { sendOpenAICompletionsRequest } from "../chat/sendOpenAICompletionsRequest";
import { performFetchRequest } from "../chat/fetchUtils";

export const _executeModel = async (
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
  const { content } = args;
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

    const bodyData = generateRequestBody({
      agentConfig,
      messages,
      userInput: content,
      contexts: agentContexts,
    });
    bodyData.stream = isStreaming;

    if (isStreaming) {
      await sendOpenAICompletionsRequest({
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
