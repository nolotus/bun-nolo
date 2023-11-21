import { handleImageEditsRequest } from './imageEdits';
import { handleImageGenerationsRequest } from './imageGeneration';
import { handleImageVariationsRequest } from './imageVariations';
import { postToOpenAIProxy } from './openai';
import { handleAudioSpeechRequest } from './speech';

export const aiServerRoute = async (req, res) => {
  const { url } = req;
  if (url.pathname.endsWith('/chat')) {
    return postToOpenAIProxy(req, res);
  } else if (url.pathname.endsWith('/audio/speech')) {
    return handleAudioSpeechRequest(req, res);
  } else if (url.pathname.endsWith('/images/generations')) {
    return handleImageGenerationsRequest(req, res);
  } else if (url.pathname.endsWith('/images/edits')) {
    return handleImageEditsRequest(req, res); // 处理图像编辑请求
  } else if (url.pathname.endsWith('/images/variations')) {
    return handleImageVariationsRequest(req, res); // 处理图像变体请求
  }
};
