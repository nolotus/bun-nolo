import { sendOpenAIRequest } from "integrations/openAI/chatRequest";

import { handleAudioReq } from "./handleAudioReq";
import { handleStreamReq } from "./handleStreamReq";

export const handleAIChatRequest = async (req, res) => {
  const requestBody = req.body;
  const type: string = requestBody.type || "text";
  console.log("type", type);
  try {
    if (type === "stream") {
      return handleStreamReq(req, res);
    }
    if (type === "audio") {
      return handleAudioReq(req, res);
    }
    console.log("handleAIChatRequest stream false");
    const result = await sendOpenAIRequest(req.body, false);
    return res.status(200).json(result.data);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred when communicating with AI" });
  }
};
