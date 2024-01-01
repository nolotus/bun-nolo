import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
	apiKey: process.env.OPENAI_KEY, // It's recommended to use environment variable for your API key
});
export const openai = new OpenAIApi(configuration);
