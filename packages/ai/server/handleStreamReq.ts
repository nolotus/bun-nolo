import { AxiosResponse } from "axios";
import { pick, map } from "rambda";

import { adjustOpenAIFrequencyPenalty } from "../openAI/adjust";
import { openaiModelPrice } from "../openAI/modelPrice";
import sendOpenAIRequest from "../openAI/sendOpenAIRequest";
import { adjustPerplexityFrequencyPenalty } from "../perplexity/adjust";
import { perplexityModelPrice } from "../perplexity/modelPrice";
import { sendPerplexityRequest } from "../perplexity/sendPerplexityRequest";

const propertiesToPick = [
	"model",
	"presence_penalty",
	"frequency_penalty",
	"top_k",
	"top_p",
	"temperature",
	"max_tokens",
];

const messagePropertiesToPick = ["content", "role"];

const pickMessages = map(pick(messagePropertiesToPick));

const createStreamResponse = (stream: AxiosResponse<any>) => {
	const textEncoder = new TextEncoder();
	const readableStream = new ReadableStream({
		start(controller) {
			stream.data.on("data", (chunk) => {
				controller.enqueue(textEncoder.encode(chunk.toString()));
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

export const handleStreamReq = async (req: Request, res) => {
	const requestBody = {
		...pick(propertiesToPick, req.body),
		messages: pickMessages(req.body.messages),
	};

	if (openaiModelPrice.hasOwnProperty(requestBody.model)) {
		requestBody.frequency_penalty = adjustOpenAIFrequencyPenalty(
			requestBody.frequency_penalty,
		);
	} else if (perplexityModelPrice.hasOwnProperty(requestBody.model)) {
		requestBody.frequency_penalty = adjustPerplexityFrequencyPenalty(
			requestBody.frequency_penalty,
		);
	} else {
		// 如果模型未知，可以选择不调整frequency_penalty，也可以设置一个默认值
		// 或者也可以选择直接返回一个响应，说明模型未知
		throw new Error(`Unknown model: ${requestBody.model}`);
	}
	console.log("requestBody.model", requestBody.model);
	if (openaiModelPrice.hasOwnProperty(requestBody.model)) {
		try {
			const response = await sendOpenAIRequest(requestBody);
			return createStreamResponse(response);
		} catch (error) {
			console.error(error.message);
		}
	} else if (perplexityModelPrice.hasOwnProperty(requestBody.model)) {
		try {
			const response = await sendPerplexityRequest(requestBody);
			return createStreamResponse(response);
		} catch (error) {
			console.error(error.message);
		}
	} else {
		throw new Error(`Unknown model: ${requestBody.model}`);
	}
};
