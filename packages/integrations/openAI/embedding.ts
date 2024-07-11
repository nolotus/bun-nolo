import { openai } from "./index";
export async function getTextEmbedding(text: string) {
  try {
    const response = await openai.createEmbedding({
      model: "text-similarity-babbage-001", // Choose an appropriate model
      input: text,
    });
    // Return the embedding vector
    return response.data.data[0].embedding;
  } catch (error) {
    return null;
  }
}
