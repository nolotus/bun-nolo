import { AxiosResponse } from "axios";
import { pickAiRequstBody } from "ai/utils/pickAiRequstBody";
import { adjustOpenAIFrequencyPenalty } from "integrations/openAI/adjust";
import { openaiModelPrice } from "integrations/openAI/modelPrice";
import { adjustPerplexityFrequencyPenalty } from "integrations/perplexity/adjust";
import { perplexityModelPrice } from "integrations/perplexity/modelPrice";

import { chatRequest as sendPerplexityRequest } from "integrations/perplexity/chatRequest";
import { chatRequest as sendMistralRequest } from "integrations/mistral/chatRequest";

import { chatRequest } from "integrations/openAI/chatRequest";
import { pickMessages } from "../utils/pickMessages";
import { mistralModelPrice } from "integrations/mistral/modelPrice";

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

export const handleStreamReq = async (req: Request, res) => {
	const requestBody = {
		...pickAiRequstBody(req.body),
		messages: pickMessages(req.body.messages),
	};
	const isBelongOenAIModel = openaiModelPrice.hasOwnProperty(requestBody.model);
	const isBelongPerplexityModel = perplexityModelPrice.hasOwnProperty(
		requestBody.model,
	);
	const isBelongMistralModel = mistralModelPrice.hasOwnProperty(
		requestBody.model,
	);

	if (isBelongOenAIModel) {
		requestBody.frequency_penalty = adjustOpenAIFrequencyPenalty(
			requestBody.frequency_penalty,
		);
		try {
			const response = await chatRequest(requestBody, true);
			return createStreamResponse(response);
		} catch (error) {
			console.error(error.message);
		}
	} else if (isBelongPerplexityModel) {
		requestBody.frequency_penalty = adjustPerplexityFrequencyPenalty(
			requestBody.frequency_penalty,
		);
		try {
			const response = await sendPerplexityRequest(requestBody);
			return createStreamResponse(response);
		} catch (error) {
			console.error(error.message);
		}
	} else if (isBelongMistralModel) {
		try {
			const response = await sendMistralRequest(requestBody, true);
			return createStreamResponse(response);
		} catch (error) {
			console.error(error.message);
		}
	} else {
		throw new Error(`Unknown model: ${requestBody.model}`);
	}
};
