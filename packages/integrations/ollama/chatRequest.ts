import axios from "utils/axios";

export async function chatRequest(
  requestBody,
  isStream: boolean,
): Promise<any> {
  const { model, messages, max_tokens } = requestBody;

  const axiosConfig = {
    method: "POST",
    url: "http://localhost:11434/api/chat",
    headers: {
      "Content-Type": "application/json",
      Accept: isStream ? "text/event-stream" : "application/json",
    },
    responseType: isStream ? "stream" : "json",
    data: {
      model,
      messages,
      stream: isStream,
      max_tokens,
    },
  };

  try {
    const response = await axios(axiosConfig);
    return response;
  } catch (err) {
    console.error("axios error:", err);
    throw err;
  }
}
