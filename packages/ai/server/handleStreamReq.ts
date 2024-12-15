import { createStreamResponse } from "ai/chat/createStreamResponse";

import { ollamaModels } from "integrations/ollama/models";
//todo  make it work
import { sendOllamaRequest } from "integrations/ollama/chatRequest";
import { googleAIModels } from "integrations/google/ai/models";
import { pick } from "rambda";
import { sendGeminiChatRequest } from "integrations/google/ai/chatRequest";

function isModelInList(modelname, modelList) {
  return modelList.hasOwnProperty(modelname);
}

async function processModelRequest(requestBody, modelType) {
  let response;
  switch (modelType) {
    case "ollama":
      response = await sendOllamaRequest(requestBody, true);
      break;
    case "google":
      response = await sendGeminiChatRequest(
        process.env.GOOGLE_API_KEY,
        requestBody
      );
      break;

    default:
      throw new Error(
        `processModelRequest Unknown model: ${requestBody.model}`
      );
  }
  return createStreamResponse(response);
}
export const pickAiRequstBody = (body) => {
  const propertiesToPick = [
    "model",
    "presence_penalty",
    "frequency_penalty",
    "top_k",
    "top_p",
    "temperature",
    "max_tokens",
    "previousMessages",
    "userInput",
    "prompt",
    "tools",
  ];
  return pick(propertiesToPick, body);
};

export const handleStreamReq = async (req: Request, res) => {
  const requestBody = {
    ...pickAiRequstBody(req.body),
  };
  try {
    if (isModelInList(requestBody.model, ollamaModels)) {
      return await processModelRequest(requestBody, "ollama");
    } else if (isModelInList(requestBody.model, googleAIModels)) {
      return await processModelRequest(requestBody, "google");
    } else {
      throw new Error(`handleStreamReq Unknown model: ${requestBody.model}`);
    }
  } catch (error) {
    // 处理错误
    console.error(`Error processing model request: ${error.message}`);
    res.status(500).send("Internal Server Error");
  }
};
