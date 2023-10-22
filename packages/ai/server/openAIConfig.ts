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
