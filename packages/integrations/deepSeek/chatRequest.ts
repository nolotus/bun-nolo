import axios from "utils/axios";

export async function chatRequest(
  requestBody,
  isStream: boolean,
): Promise<any> {
  const { model, messages, max_tokens } = requestBody;

  const axiosConfig = {
    method: "POST",
    url: "https://api.deepseek.com/chat/completions",
    responseType: isStream ? "stream" : "json",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.DEEPSEEK_KEY}`,
      Accept: isStream ? "text/event-stream" : "application/json",
    },
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
    throw err;
  }
}
