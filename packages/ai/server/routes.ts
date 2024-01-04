import { handleImageEditsRequest } from "./imageEdits";
import { handleImageGenerationsRequest } from "./imageGeneration";
import { handleImageVariationsRequest } from "./imageVariations";
import { postToOpenAIProxy } from "./openai";
import { handleAudioSpeechRequest } from "./speech";

export const aiServerRoute = async (req, res) => {
	const { url } = req;
	if (url.pathname.endsWith("/chat")) {
		return postToOpenAIProxy(req, res);
	}
	if (url.pathname.endsWith("/audio/speech")) {
		return handleAudioSpeechRequest(req, res);
	}
	if (url.pathname.endsWith("/images/generations")) {
		return handleImageGenerationsRequest(req, res);
	}
	if (url.pathname.endsWith("/images/edits")) {
		return handleImageEditsRequest(req, res);
	}
	if (url.pathname.endsWith("/images/variations")) {
		return handleImageVariationsRequest(req, res);
	}
};
