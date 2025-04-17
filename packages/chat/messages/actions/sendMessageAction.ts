import { selectCurrentDialogConfig } from "chat/dialog/dialogSlice";
import { read } from "database/dbSlice";
import { extractCustomId } from "core/prefix";
import { selectCurrentUserId } from "auth/authSlice";
import { createDialogMessageKey } from "database/keys";
import { buildReferenceContext } from "ai/context/buildReferenceContext";
import { NoloRootState } from "app/store";
import { addMsg } from "../messageSlice";
import { generateAnthropicRequestBody } from "integrations/anthropic/generateRequestBody";
import { generateOpenAIRequestBody } from "integrations/openai/generateRequestBody";
import { requestHandlers } from "ai/llm/providers";
import { DialogInvocationMode } from "../../dialog/types";

interface CybotConfig {
  provider: string;
  model: string;
  prompt?: string;
  name?: string;
  [key: string]: any;
}

export const generateRequestBody = (
  state: NoloRootState,
  userInput: string | { type: string; data: string }[],
  cybotConfig: CybotConfig,
  context?: any
) => {
  const providerName = cybotConfig.provider.toLowerCase();

  if (providerName === "anthropic") {
    return generateAnthropicRequestBody(state, userInput, cybotConfig, context);
  }
  return generateOpenAIRequestBody(
    state,
    userInput,
    cybotConfig,
    providerName,
    context
  );
};

export const sendMessageAction = async (args, thunkApi) => {
  const { userInput } = args;
  const state = thunkApi.getState();
  const dispatch = thunkApi.dispatch;

  const dialogConfig = selectCurrentDialogConfig(state);
  const cybotConfig = await dispatch(read(dialogConfig.cybots[0])).unwrap();
  const dialogKey = dialogConfig.dbKey || dialogConfig.id;
  console.log("dialogConfig", dialogConfig);
  const dialogId = extractCustomId(dialogKey);
  const userId = selectCurrentUserId(state);
  const msgId = createDialogMessageKey(dialogId);

  const msg = {
    id: msgId,
    role: "user",
    content: userInput,
    userId,
  };

  await dispatch(addMsg(msg));
  const providerName = cybotConfig.provider.toLowerCase();
  const context = await buildReferenceContext(cybotConfig, dispatch);
  const bodyData = generateRequestBody(state, userInput, cybotConfig, context);
  if (dialogConfig.mode === DialogInvocationMode.FIRST) {
    const handler = requestHandlers[providerName];
    if (!handler) {
      throw new Error(`Unsupported provider: ${cybotConfig.provider}`);
    }
    handler({
      bodyData,
      cybotConfig,
      thunkApi,
      dialogKey,
    });
  }
};
