export const mistralModels: Model[] = [
  {
    name: "Mistral Large",
    maxOutputTokens: "8k",
    contextWindow: "128k",
    humanEval: "92.1",
    price: {
      input: 2,
      output: 6,
    },
    supportsTool: true,
    hasVision: false,
  },
  {
    name: "mistral-nemo",
    maxOutputTokens: "8k",
    contextWindow: "128k",
    humanEval: "未知",
    price: {
      input: 0.15,
      output: 0.15,
    },
    supportsTool: true,
  },
  {
    name: "Pixtral 12B",
    maxOutputTokens: "8k",
    contextWindow: "128k",
    humanEval: "未知",
    price: {
      input: 0.15,
      output: 0.15,
    },
    supportsTool: true,
  },
];

export const anthropicModels: Model[] = [
  {
    name: "Claude 3.5 Sonnet",
    maxOutputTokens: "8k",
    contextWindow: "200k",
    humanEval: "92",
    price: {
      input: 3.75,
      output: 15,
    },
    supportsTool: true,
    hasVision: true,
  },
];

export const openaiModels: Model[] = [
  {
    name: "GPT4-O",
    maxOutputTokens: "8k",
    contextWindow: "128k",
    humanEval: "90.2",
    price: {
      input: 2.5,
      output: 10,
    },
  },
  {
    name: "GPT4-O Mini",
    maxOutputTokens: "8k",
    contextWindow: "128k",
    humanEval: "88.4",
    price: {
      input: 0.15,
      output: 0.6,
    },
  },
  {
    name: "O1-Preview",
    maxOutputTokens: "128k",
    contextWindow: "128k",
    humanEval: "92.4",
    price: {
      input: 15.0,
      output: 60.0,
    },
    supportsTool: true,
    hasVision: false,
  },
  {
    name: "O1-Mini",
    maxOutputTokens: "128k",
    contextWindow: "128k",
    humanEval: "92.4",
    price: {
      input: 3.0,
      output: 12.0,
    },
    supportsTool: true,
    hasVision: false,
  },
];

export const googleModels: Model[] = [
  {
    name: "Gimini 1.5 Pro",
    maxOutputTokens: "8k",
    contextWindow: "2m",
    humanEval: "84.1",
    price: {
      input: 1.25,
      output: 5.0,
    },
    hasVision: true,
  },
  {
    name: "Gimini 1.5 Flash",
    maxOutputTokens: "8k",
    contextWindow: "1m",
    humanEval: "74.3",
    price: {
      input: 0.075,
      output: 0.3,
    },
    supportsTool: true,
    hasVision: true,
  },
];

export const deepseekModels: Model[] = [
  {
    name: "DeepSeek 2.5",
    maxOutputTokens: "8k",
    contextWindow: "128k",
    humanEval: "89",
    price: {
      input: 0.14,
      output: 0.28,
    },
    supportsTool: true,
  },
];
