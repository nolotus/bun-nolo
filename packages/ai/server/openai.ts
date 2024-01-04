import { getLogger } from "utils/logger";

import { FrontEndRequestBody } from "../types";

import { handleAudioReq } from "./handleAudioReq";
import { handleStreamReq } from "./handleStreamReq";
import { handleTextReq } from "./handleTextReq";

const openAiLogger = getLogger("OpenAI");

export const postToOpenAIProxy = async (req, res): Promise<void> => {
	openAiLogger.info("Received a request to post to AI");

	const requestBody: FrontEndRequestBody = req.body;
	const type: string = requestBody.type || "text";
	console.log("type", type);
	try {
		if (type === "text") {
			return handleTextReq(req, res);
		}
		if (type === "stream") {
			return handleStreamReq(req, res);
		}
		if (type === "audio") {
			return handleAudioReq(req, res);
		}
		openAiLogger.error("Invalid type specified");
		return res.status(400).json({ error: "Invalid type specified" });
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
