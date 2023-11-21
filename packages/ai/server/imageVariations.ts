import axios from 'axios';

import { createOpenAIRequestConfig } from './openAIConfig';

interface ImageVariationsRequest {
  image: File; // 确保这里的类型与您的实际情况相符
  model?: string;
  n?: number;
  response_format?: string;
  size?: string;
  user?: string;
}

export const handleImageVariationsRequest = async (req, res) => {
  if (req.method === 'POST') {
    try {
      const requestData: ImageVariationsRequest = req.body;

      // 验证必要字段
      if (!requestData.image) {
        throw new Error('Invalid or missing image');
      }

      // 构建请求体
      const formData = new FormData();
      formData.append('image', requestData.image);
      formData.append('model', requestData.model || 'dall-e-2');
      formData.append('n', requestData.n?.toString() || '1');
      formData.append('size', requestData.size || '1024x1024');
      formData.append('response_format', requestData.response_format || 'url');
      if (requestData.user) {
        formData.append('user', requestData.user);
      }

      const config = createOpenAIRequestConfig();
      config.headers['Content-Type'] = 'multipart/form-data';

      // 发送请求到 OpenAI API
      const openAIResponse = await axios.post(
        'https://api.openai.com/v1/images/variations',
        formData,
        config,
      );

      console.log('openAIResponse', openAIResponse);
      return res.status(200).json({ data: openAIResponse.data });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
};
