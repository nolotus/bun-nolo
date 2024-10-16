async function generateGeminiContent(
  apiKey: string,
  userInput: string,
  previousMessages: Content[],
  model: string | null = null,
  prompt: string,
) {
  const requestBody = {
    contents: [
      ...previousMessages,
      {
        role: "user",
        parts: [
          {
            text: userInput,
          },
        ],
      },
    ],
    systemInstruction: {
      role: "user",
      parts: [
        {
          text: prompt,
        },
      ],
    },
    generationConfig: {
      temperature: 1,
      topK: 64,
      topP: 0.95,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    },
  };
  console.log("requestBody", requestBody);
  const modelName = model || "gemini-1.5-pro";

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
      requestBody,
      {
        headers: {
          "Content-Type": "application/json",
        },
        responseType: "json",
      },
    );

    console.log(response.data);
  } catch (error) {
    console.error("生成内容时出错:", error);
  }
}
