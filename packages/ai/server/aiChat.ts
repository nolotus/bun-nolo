import { FrontEndRequestBody } from "../types";

import { handleAudioReq } from "./handleAudioReq";
import { handleStreamReq } from "./handleStreamReq";
import { chatRequest } from "integrations/openAI/chatRequest";

export const handleAIChatRequest = async (req, res) => {
  const requestBody: FrontEndRequestBody = req.body;
  const type: string = requestBody.type || "text";
  try {
    if (type === "stream") {
      return handleStreamReq(req, res);
    }
    if (type === "audio") {
      return handleAudioReq(req, res);
    }

    const result = await chatRequest(req.body, false);
    console.log("result", result);
    return res.status(200).json(result.data);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred when communicating with AI" });
  }
};
