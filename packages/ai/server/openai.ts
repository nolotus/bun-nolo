import { getLogger } from "utils/logger";

import { FrontEndRequestBody } from "../types";

import { handleAudioReq } from "./handleAudioReq";
import { handleStreamReq } from "./handleStreamReq";
import { chatRequest } from "integrations/openAI/chatRequest";

const openAiLogger = getLogger("OpenAI");

export const postToOpenAIProxy = async (req, res) => {
	const requestBody: FrontEndRequestBody = req.body;
	const type: string = requestBody.type || "text";
	openAiLogger.info(type, "Received a request to post to AI");

	try {
		if (type === "stream") {
			return handleStreamReq(req, res);
		}
		if (type === "audio") {
			return handleAudioReq(req, res);
		}
		const result = await chatRequest(req.body, false);
		return res.status(200).json(result.data);
	} catch (error) {
		openAiLogger.error(
			"An error occurred when communicating with OpenAI",
			error,
		);
		return res
			.status(500)
			.json({ error: "An error occurred when communicating with OpenAI" });
	}
};
