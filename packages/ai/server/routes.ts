import { postToOpenAIProxy } from './openai';
import { handleAudioSpeechRequest } from './speech';

export const aiServerRoute = async (req, res) => {
  const { url } = req;
  if (url.pathname.endsWith('/chat')) {
    return postToOpenAIProxy(req, res);
  } else if (url.pathname.endsWith('/audio/speech')) {
    return handleAudioSpeechRequest(req, res);
  }
};
