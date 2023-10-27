import { getLogger } from "utils/logger";

import { FrontEndRequestBody } from "../types";
import { handleAudioReq } from "./handleAudioReq";
import { handleTextReq } from "./handleTextReq";
import { handleStreamReq } from "./handleStreamReq";
import { handleImageReq } from "./handleImageReq";

const openAiLogger = getLogger("OpenAI");

export const postToOpenAIProxy = async (req, res): Promise<void> => {
  openAiLogger.info("Received a request to post to OpenAI");

  const requestBody: FrontEndRequestBody = req.body;
  const type: string = requestBody.type || "text";
  try {
    if (type === "text") {
      return handleTextReq(req, res);
    } else if (type === "image") {
      return handleImageReq(req, res);
    } else if (type === "stream") {
      return handleStreamReq(req, res);
    } else if (type === "audio") {
      return handleAudioReq(req, res);
    } else {
      openAiLogger.error("Invalid type specified");
      return res.status(400).json({ error: "Invalid type specified" });
    }
  } catch (error) {
    openAiLogger.error(
      "An error occurred when communicating with OpenAI",
      error
    );
    return res
      .status(500)
      .json({ error: "An error occurred when communicating with OpenAI" });
  }
};
