// File: integrations/google/ai/models.js

export const googleAIModels = {
  "gemini-1.5-pro": {
    provider: "google",
    name: "Gemini 1.5 Pro",
    description: "Most capable model for a wide range of tasks",
    strengths: "Highest level of intelligence and capability",
    features: {
      vision: true,
      audio: true,
    },
    api: {
      name: "models/gemini-1.5-pro",
      format: "Gemini API",
    },
    tokenLimits: {
      inputTokenLimit: 2097152, // 2,097,152 tokens
      outputTokenLimit: 8192, // 8,192 tokens
    },
    audioVisualSpecs: {
      maxImagesPerPrompt: 7200,
      maxVideoLength: "2 hours",
      maxAudioLength: "Approximately 19 hours",
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
      free: {
        rpm: 2, // Requests Per Minute
        tpm: 32000, // Tokens Per Minute
        rpd: 50, // Requests Per Day
      },
      payAsYouGo: {
        rpm: 1000, // Requests Per Minute
        tpm: 4000000, // Tokens Per Minute
      },
    },
  },
  "gemini-1.5-flash": {
    provider: "google",
    name: "Gemini 1.5 Flash",
    description: "High speed model with flexible pricing",
    strengths: "Cost-effective for extended prompts",
    features: {
      vision: true,
      audio: true,
    },
    api: {
      name: "models/gemini-1.5-flash",
      format: "Gemini API",
    },
    tokenLimits: {
      inputTokenLimit: 1048576, // 1,048,576 tokens
      outputTokenLimit: 8192, // 8,192 tokens
    },
    audioVisualSpecs: {
      maxImagesPerPrompt: 3600,
      maxVideoLength: "1 hour",
      maxAudioLength: "Approximately 9.5 hours",
    },
    performance: {
      latency: "medium",
      contextWindow: 128000, // 128K tokens
    },
    pricing: {
      standard: {
        input: 0.075, // $0.075 per 1M tokens
        output: 0.3, // $0.30 per 1M tokens
        contextCaching: 0.01875, // $0.01875 per 1M tokens
      },
      extended: {
        input: 0.15, // $0.15 per 1M tokens
        output: 0.6, // $0.60 per 1M tokens
        contextCaching: 0.0375, // $0.0375 per 1M tokens
      },
      contextStorage: 1.0, // $1.00 per 1M tokens per hour
    },
    tuning: {
      available: true,
      serviceCharge: "free",
      inputOutputPrice: "same as standard",
      productImprovement: "no",
    },
    limits: {
      rpm: 2000, // Requests Per Minute
      tpm: 4000000, // Tokens Per Minute
    },
  },
};
export const geminiModelNames = Object.keys(googleAIModels);
