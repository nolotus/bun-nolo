import { createStreamResponse } from "ai/chat/createStreamResponse";

import { adjustPerplexityFrequencyPenalty } from "integrations/perplexity/adjust";
import { openAIModels } from "integrations/openAI/models";

import { mistralModels } from "integrations/mistral/models";
import { perplexityModelPrice } from "integrations/perplexity/modelPrice";
import { deepSeekModels } from "integrations/deepSeek/models";
import { zhipuModels } from "integrations/zhipu/models";
import { ollamaModels } from "integrations/ollama/models";
import { claudeModels } from "integrations/anthropic/models";
import { sendMistralRequest } from "integrations/mistral/chatRequest";
import { sendOpenAIRequest } from "integrations/openAI/chatRequest";
import { sendDeepSeekRequest } from "integrations/deepSeek/chatRequest";
import { sendDeepinfraChatRequest } from "integrations/deepinfra/chatRequest";

//todo  make it work
import { sendOllamaRequest } from "integrations/ollama/chatRequest";
import { chatRequest as sendPerplexityRequest } from "integrations/perplexity/chatRequest";
import { chatRequest as sendZhihuRequest } from "integrations/zhipu/chatRequest";
import { chatRequest as sendAnthropicRequest } from "integrations/anthropic/chatRequest";
import { googleAIModels } from "integrations/google/ai/models";
import { pick } from "rambda";
import { sendGeminiChatRequest } from "integrations/google/ai/chatRequest";
import { baseLogger } from "utils/logger";
import { deepinfraModels } from "integrations/deepinfra/models";

function isModelInList(modelname, modelList) {
  return modelList.hasOwnProperty(modelname);
}

async function processModelRequest(requestBody, modelType) {
  let response;
  switch (modelType) {
    case "openai":
      response = await sendOpenAIRequest(requestBody, true);
      break;
    case "perplexity":
      requestBody.frequency_penalty = adjustPerplexityFrequencyPenalty(
        requestBody.frequency_penalty,
      );
      response = await sendPerplexityRequest(requestBody);
      break;
    case "mistral":
      response = await sendMistralRequest(requestBody, true);
      break;
    case "deepSeek":
      response = await sendDeepSeekRequest(requestBody, true);
      break;
    case "zhipu":
      response = await sendZhihuRequest(requestBody, true);
      break;
    case "ollama":
      response = await sendOllamaRequest(requestBody, true);
      break;
    case "claude":
      response = await sendAnthropicRequest(requestBody);
      break;
    case "google":
      response = await sendGeminiChatRequest(
        process.env.GOOGLE_API_KEY,
        requestBody,
      );
      break;
    case "deepinfra":
      response = await sendDeepinfraChatRequest(
        process.env.DEEPINFRA_API_KEY,
        requestBody,
        true,
      );
      break;
    default:
      throw new Error(
        `processModelRequest Unknown model: ${requestBody.model}`,
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
  ];
  return pick(propertiesToPick, body);
};

export const handleStreamReq = async (req: Request, res) => {
  const requestBody = {
    ...pickAiRequstBody(req.body),
  };
  console.log("handleStreamReq", requestBody);
  try {
    if (isModelInList(requestBody.model, openAIModels)) {
      return await processModelRequest(requestBody, "openai");
    } else if (isModelInList(requestBody.model, perplexityModelPrice)) {
      return await processModelRequest(requestBody, "perplexity");
    } else if (isModelInList(requestBody.model, mistralModels)) {
      return await processModelRequest(requestBody, "mistral");
    } else if (isModelInList(requestBody.model, deepSeekModels)) {
      return await processModelRequest(requestBody, "deepSeek");
    } else if (isModelInList(requestBody.model, zhipuModels)) {
      return await processModelRequest(requestBody, "zhipu");
    } else if (isModelInList(requestBody.model, ollamaModels)) {
      return await processModelRequest(requestBody, "ollama");
    } else if (isModelInList(requestBody.model, claudeModels)) {
      return await processModelRequest(requestBody, "claude");
    } else if (isModelInList(requestBody.model, googleAIModels)) {
      return await processModelRequest(requestBody, "google");
    } else if (isModelInList(requestBody.model, deepinfraModels)) {
      return await processModelRequest(requestBody, "deepinfra");
    } else {
      throw new Error(`handleStreamReq Unknown model: ${requestBody.model}`);
    }
  } catch (error) {
    // 处理错误
    console.error(`Error processing model request: ${error.message}`);
    res.status(500).send("Internal Server Error");
  }
};
