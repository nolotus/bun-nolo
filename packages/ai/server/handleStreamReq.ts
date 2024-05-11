import { AxiosResponse } from "axios";
import { pickAiRequstBody } from "ai/utils/pickAiRequstBody";
import { adjustOpenAIFrequencyPenalty } from "integrations/openAI/adjust";
import { adjustPerplexityFrequencyPenalty } from "integrations/perplexity/adjust";

import { openaiModelPrice } from "integrations/openAI/modelPrice";
import { mistralModelPrice } from "integrations/mistral/modelPrice";
import { perplexityModelPrice } from "integrations/perplexity/modelPrice";
import { deepSeekModels } from "integrations/deepSeek/models";

import { chatRequest as sendPerplexityRequest } from "integrations/perplexity/chatRequest";
import { chatRequest as sendMistralRequest } from "integrations/mistral/chatRequest";
import { chatRequest } from "integrations/openAI/chatRequest";
import { chatRequest as sendDeepSeekRequest } from "integrations/deepSeek/chatRequest";

import { pickMessages } from "../utils/pickMessages";
function isModelInPriceList(model, priceList) {
  return priceList.hasOwnProperty(model);
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
    default:
      throw new Error(`Unknown model: ${requestBody.model}`);
  }
  return createStreamResponse(response);
}

export const handleStreamReq = async (req: Request, res) => {
  const requestBody = {
    ...pickAiRequstBody(req.body),
    messages: pickMessages(req.body.messages),
  };

  try {
    if (isModelInPriceList(requestBody.model, openaiModelPrice)) {
      return await processModelRequest(requestBody, "openai");
    } else if (isModelInPriceList(requestBody.model, perplexityModelPrice)) {
      return await processModelRequest(requestBody, "perplexity");
    } else if (isModelInPriceList(requestBody.model, mistralModelPrice)) {
      return await processModelRequest(requestBody, "mistral");
    } else if (isModelInPriceList(requestBody.model, deepSeekModels)) {
      return await processModelRequest(requestBody, "deepSeek");
    } else {
      throw new Error(`Unknown model: ${requestBody.model}`);
    }
  } catch (error) {
    console.error(error.message);
  }
};
