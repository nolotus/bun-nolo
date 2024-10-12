import { chatRequest } from "integrations/openAI/chatRequest";
import { MessageRole } from "chat/messages/types";

import { handleAudioReq } from "./handleAudioReq";
import { handleStreamReq } from "./handleStreamReq";
export interface ChatRequestBody {
  type: "text" | "image" | "audio";
  model?: string;
  messages?: Array<{
    role: MessageRole;
    content: string;
  }>;
  prompt?: string;
  n?: number;
  size?: string;
  file?: Buffer;
}
export const handleAIChatRequest = async (req, res) => {
  const requestBody: ChatRequestBody = req.body;
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
