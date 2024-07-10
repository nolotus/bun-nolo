import { AxiosResponse } from "axios";
import { pickAiRequstBody } from "ai/utils/pickAiRequstBody";
import { adjustOpenAIFrequencyPenalty } from "integrations/openAI/adjust";
import { adjustPerplexityFrequencyPenalty } from "integrations/perplexity/adjust";

import { openAIModels } from "integrations/openAI/models";

import { mistralModels } from "integrations/mistral/models";
import { perplexityModelPrice } from "integrations/perplexity/modelPrice";
import { deepSeekModels } from "integrations/deepSeek/models";
import { zhipuModels } from "integrations/zhipu/models";
import { ollamaModels } from "integrations/ollama/models";
import { claudeModels } from "integrations/anthropic/models";
import { chatRequest as sendPerplexityRequest } from "integrations/perplexity/chatRequest";
import { chatRequest as sendMistralRequest } from "integrations/mistral/chatRequest";
import { chatRequest } from "integrations/openAI/chatRequest";
import { chatRequest as sendDeepSeekRequest } from "integrations/deepSeek/chatRequest";
import { chatRequest as sendZhihuRequest } from "integrations/zhipu/chatRequest";
import { chatRequest as sendOllamaRequest } from "integrations/ollama/chatRequest";
import { chatRequest as sendAnthropicRequest } from "integrations/anthropic/chatRequest";

import { pickMessages } from "../utils/pickMessages";

function isModelInList(modelname, modelList) {
  return modelList.hasOwnProperty(modelname);
}

const createStreamResponse = (stream: AxiosResponse<any>) => {
  const textEncoder = new TextEncoder();
  const readableStream = new ReadableStream({
    start(controller) {
      stream.data.on("data", (chunk) => {
        const value = textEncoder.encode(chunk.toString());
        controller.enqueue(value);
      });
      stream.data.on("end", () => {
        controller.close();
      });
    },
  });

  const responseHeaders = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  };
  return new Response(readableStream, { headers: responseHeaders });
};
async function processModelRequest(requestBody, modelType) {
  let response;
  switch (modelType) {
    case "openai":
      requestBody.frequency_penalty = adjustOpenAIFrequencyPenalty(
        requestBody.frequency_penalty,
      );
      response = await chatRequest(requestBody, true);
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
      response = await sendAnthropicRequest(requestBody, true);
      break;
    default:
      throw new Error(
        `processModelRequest Unknown model: ${requestBody.model}`,
      );
  }
  return createStreamResponse(response);
}

export const handleStreamReq = async (req: Request, res) => {
  const requestBody = {
    ...pickAiRequstBody(req.body),
    messages: pickMessages(req.body.messages),
  };

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
    } else {
      throw new Error(`handleStreamReq Unknown model: ${requestBody.model}`);
    }
  } catch (error) {
    console.error(error.message);
  }
};
