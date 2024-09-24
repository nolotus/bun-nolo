// File: integrations/google/ai/models.js

export const googleAIModels = {
  "gemini-1.5-pro": {
    provider: "google",
    name: "Gemini 1.5 Pro",
    description: "Most capable model for a wide range of tasks",
    strengths: "Highest level of intelligence and capability",
    features: {
      multilingual: true,
      vision: true,
      audio: true,
    },
    api: {
      name: "gemini-1.5-pro",
      format: "Gemini API",
    },
    performance: {
      latency: "medium",
      contextWindow: 128000, // 128K tokens
      maxOutputTokens: 2048,
    },
    training: {
      dataCutoff: "2023-12",
    },
    input: 0.075, // $0.075 per 1M tokens
    output: 0.3, // $0.30 per 1M tokens
    limits: {
      rpm: 1000, // Requests Per Minute
      tpm: 4000000, // Tokens Per Minute
    },
  },
  "gemini-1.0-pro": {
    provider: "google",
    name: "Gemini 1.0 Pro",
    description: "Balanced model for most tasks",
    strengths: "Strong performance across a wide range of tasks",
    features: {
      multilingual: true,
      vision: true,
    },
    api: {
      name: "gemini-1.0-pro",
      format: "Gemini API",
    },
    performance: {
      latency: "fast",
      contextWindow: 32768,
      maxOutputTokens: 2048,
    },
    training: {
      dataCutoff: "2023-08",
    },
    input: 0.075, // $0.075 per 1M tokens
    output: 0.3, // $0.30 per 1M tokens
    limits: {
      rpm: 1000, // Requests Per Minute
      tpm: 4000000, // Tokens Per Minute
    },
  },
  "gemini-1.0-pro-vision": {
    provider: "google",
    name: "Gemini 1.0 Pro Vision",
    description: "Multimodal model for text and vision tasks",
    strengths: "Strong performance in visual understanding and generation",
    features: {
      multilingual: true,
      vision: true,
    },
    api: {
      name: "gemini-1.0-pro-vision",
      format: "Gemini API",
    },
    performance: {
      latency: "medium",
      contextWindow: 32768,
      maxOutputTokens: 2048,
    },
    training: {
      dataCutoff: "2023-08",
    },
    input: 0.075, // $0.075 per 1M tokens
    output: 0.3, // $0.30 per 1M tokens
    limits: {
      rpm: 1000, // Requests Per Minute
      tpm: 4000000, // Tokens Per Minute
    },
  },
};
