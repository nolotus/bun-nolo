import axios from "utils/axios";

// 默认的 tools 数组
const defaultTools = [
  {
    type: "function",
    function: {
      name: "calculate_sum",
      description: "计算两个数的和",
      parameters: {
        type: "object",
        properties: {
          num1: {
            type: "number",
            description: "第一个数",
          },
          num2: {
            type: "number",
            description: "第二个数",
          },
        },
        required: ["num1", "num2"],
      },
    },
  },
];

export async function sendOllamaRequest(
  requestBody,
  isStream: boolean,
): Promise<any> {
  const { model, messages, max_tokens, tools = defaultTools } = requestBody;
  console.log("requestBody", requestBody);
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
      tools,
    },
  };

  try {
    const response = await axios(axiosConfig);
    return response;
  } catch (err) {
    throw err;
  }
}
