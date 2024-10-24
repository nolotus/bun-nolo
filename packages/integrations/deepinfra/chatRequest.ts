import { AxiosResponse, AxiosRequestConfig } from "axios";
import axios from "utils/axios";
import { adjustOpenAIFrequencyPenalty } from "integrations/openAI/adjust";
import { pick, map } from "rambda";
import { createPromptMessage } from "ai/prompt/createPromptMessage";

interface OpenAIConfig {
  messages: Array<any>;
  model: string;
  frequency_penalty?: number | null; // Number between -2.0 and 2.0. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.
  logit_bias?: { [key: string]: number } | null; // Modify the likelihood of specified tokens appearing in the completion.
  logprobs?: boolean | null; // Whether to return log probabilities of the output tokens or not.
  top_logprobs?: number | null; // An integer between 0 and 20 specifying the number of most likely tokens to return at each token position, each with an associated log probability.
  max_tokens?: number | null; // The maximum number of tokens that can be generated in the chat completion. This value is now deprecated in favor of max_completion_tokens.
  max_completion_tokens?: number | null; // An upper bound for the number of tokens that can be generated for a completion, including visible output tokens and reasoning tokens.
  n?: number | null; // How many chat completion choices to generate for each input message. Note that you will be charged based on the number of generated tokens across all of the choices.
  presence_penalty?: number | null; // Number between -2.0 and 2.0. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.
  response_format?: { type: string; json_schema?: any } | null; // An object specifying the format that the model must output.
  seed?: number | null; // If specified, our system will make a best effort to sample deterministically.
  stream?: boolean | null; // If set, partial message deltas will be sent, like in ChatGPT.
  stream_options?: { include_usage?: boolean } | null; // Options for streaming response. Only set this when you set stream: true.
  temperature?: number | null; // What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.
  top_p?: number | null; // An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass.
  tools?: Array<any> | null; // A list of tools the model may call. Currently, only functions are supported as a tool.
  tool_choice?: string | { type: string; function: { name: string } } | null; // Controls which (if any) tool is called by the model.
  parallel_tool_calls?: boolean; // Whether to enable parallel function calling during tool use.
}

export const sendDeepinfraChatRequest = async (
  apiKey,
  requestBody,
  isStream: boolean,
): Promise<AxiosResponse<any> | null> => {
  if (!requestBody.model) {
    return null;
  }

  requestBody.frequency_penalty = adjustOpenAIFrequencyPenalty(
    requestBody.frequency_penalty,
  );
  const promotMessage = createPromptMessage(
    requestBody.model,
    requestBody.prompt,
  );

  const messages = [
    promotMessage,
    ...(requestBody.previousMessages || []),
    {
      role: "user",
      content: requestBody.userInput,
    },
  ];

  const messagePropertiesToPick = ["content", "role", "images"];
  const pickMessages = map(pick(messagePropertiesToPick));

  const openAIConfig: OpenAIConfig = {
    model: requestBody.model,
    messages: pickMessages(messages),
    stream: isStream,
    max_completion_tokens: requestBody.max_tokens,
  };

  const config: AxiosRequestConfig = {
    url: "https://api.deepinfra.com/v1/openai/chat/completions",
    method: "POST",
    responseType: openAIConfig.stream ? "stream" : "json",
    data: openAIConfig,
    headers: {
      "Content-Type": "application/json",
      Authorization: apiKey,
    },
  };

  try {
    const response = await axios.request(config);
    return response;
  } catch (error) {
    return null;
  }
};
