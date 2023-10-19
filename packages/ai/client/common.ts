import {createContent} from './createContent';

export const createRequestBody = (type: string, payload: any, config: any) => {
  const model = config.model || 'gpt-3.5-turbo-16k';

  const content = createContent(config);

  if (type === 'text' || type === 'stream') {
    const {userMessage, prevMessages} = payload;
    return {
      type,
      model,
      messages: [
        {role: 'system', content},
        ...prevMessages,
        {role: 'user', content: userMessage},
      ],
      temperature: config.temperature || 0.8,
      max_tokens: config.max_tokens || 512,
      top_p: config.top_p || 0.9,
      frequency_penalty: config.frequency_penalty || 0,
      presence_penalty: config.presence_penalty || 0,
      stream: type === 'stream', // 根据 type 的值来决定是否添加 stream 参数
    };
  } else if (type === 'image') {
    const {prompt, n, size} = payload;
    return {
      type,
      model,
      prompt: prompt || config.prompt || 'a white siamese cat',
      n: n || config.n || 1,
      size: size || config.size || '1024x1024',
      // 在这里没有添加 stream 参数
    };
  } else {
    throw new Error('Invalid type specified');
  }
};
