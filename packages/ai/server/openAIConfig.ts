interface OpenAIHeaders {
  'Content-Type': string;
  Authorization: string;
}
export const getOpenAIHeaders = (): OpenAIHeaders => {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.OPENAI_KEY || ''}`,
  };
};
const useProxy = process.env.USE_PROXY === 'true';

export const createOpenAIRequestConfig = () => {
  const openAIHeaders = getOpenAIHeaders();
  return {
    ...(useProxy && {
      proxy: {
        protocol: 'http',
        host: '127.0.0.1',
        port: 10080,
      },
    }),
    headers: openAIHeaders,
  };
};
export const openAIConfig = createOpenAIRequestConfig();
