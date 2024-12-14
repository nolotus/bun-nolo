import { handleStreamReq } from "./handleStreamReq";

export const handleAIChatRequest = async (req, res) => {
  const requestBody = req.body;
  const type: string = requestBody.type || "text";
  console.log("type", type);
  try {
    if (type === "stream") {
      return handleStreamReq(req, res);
    }
    console.log("handleAIChatRequest stream false");
    return res.status(200);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred when communicating with AI" });
  }
};
