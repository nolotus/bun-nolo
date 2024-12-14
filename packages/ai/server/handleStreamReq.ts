import { createStreamResponse } from "ai/chat/createStreamResponse";

import { adjustPerplexityFrequencyPenalty } from "integrations/perplexity/adjust";

import { mistralModels } from "integrations/mistral/models";
import { perplexityModelPrice } from "integrations/perplexity/modelPrice";
import { ollamaModels } from "integrations/ollama/models";
import { sendMistralRequest } from "integrations/mistral/chatRequest";
//todo  make it work
import { sendOllamaRequest } from "integrations/ollama/chatRequest";
import { chatRequest as sendPerplexityRequest } from "integrations/perplexity/chatRequest";
import { googleAIModels } from "integrations/google/ai/models";
import { pick } from "rambda";
import { sendGeminiChatRequest } from "integrations/google/ai/chatRequest";

function isModelInList(modelname, modelList) {
  return modelList.hasOwnProperty(modelname);
}

async function processModelRequest(requestBody, modelType) {
  let response;
  switch (modelType) {
    case "perplexity":
      requestBody.frequency_penalty = adjustPerplexityFrequencyPenalty(
        requestBody.frequency_penalty
      );
      response = await sendPerplexityRequest(requestBody);
      break;
    case "mistral":
      response = await sendMistralRequest(requestBody, true);
      break;
      break;
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
    if (isModelInList(requestBody.model, perplexityModelPrice)) {
      return await processModelRequest(requestBody, "perplexity");
    } else if (isModelInList(requestBody.model, mistralModels)) {
      return await processModelRequest(requestBody, "mistral");
    } else if (isModelInList(requestBody.model, ollamaModels)) {
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
