import { getLogger } from "utils/logger";

import { FrontEndRequestBody } from "../types";

import { handleAudioReq } from "./handleAudioReq";
import { handleStreamReq } from "./handleStreamReq";
import { chatRequest } from "integrations/openAI/chatRequest";

const aiLogger = getLogger("ai");

export const handleAIChatRequest = async (req, res) => {
  const requestBody: FrontEndRequestBody = req.body;
  const type: string = requestBody.type || "text";
  aiLogger.info(type, "Received a request to post to AI");

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
    aiLogger.error("An error occurred when communicating with AI", error);
    return res
      .status(500)
      .json({ error: "An error occurred when communicating with AI" });
  }
};
