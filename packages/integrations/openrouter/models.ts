export const openrouterModels = [
  // --- MoonshotAI Models (Kimi) ---
  {
    name: "moonshotai/kimi-k2-thinking",
    displayName: "MoonshotAI: Kimi K2 Thinking",
    hasVision: false,
    price: {
      input: 0.6 * 9,
      output: 2.5 * 9,
      cachingRead: 0.15 * 9,
    },
    maxOutputTokens: 262144,
    contextWindow: 262144,
    supportsTool: false,
  },

  // --- OpenAI Models (GPT) ---
  {
    name: "openai/gpt-5.1",
    displayName: "OpenAI: GPT-5.1",
    hasVision: true,
    price: {
      input: 1.25 * 9,
      output: 10 * 9,
      webSearch: 10 * 9,
    },
    maxOutputTokens: 200000,
    contextWindow: 400000,
    supportsTool: true,
  },
  {
    name: "openai/gpt-5.1-codex",
    displayName: "OpenAI: GPT-5.1-Codex",
    hasVision: true,
    price: {
      input: 1.25 * 9,
      output: 10 * 9,
      webSearch: 10 * 9,
    },
    maxOutputTokens: 200000,
    contextWindow: 400000,
    supportsTool: true,
  },
  {
    name: "openai/gpt-5.1-codex-max",
    displayName: "OpenAI: GPT-5.1-Codex-Max",
    hasVision: true,
    price: {
      input: 1.25 * 9,
      output: 10 * 9,
      webSearch: 10 * 9,
    },
    maxOutputTokens: 200000,
    contextWindow: 400000,
    supportsTool: true,
  },
  {
    name: "openai/gpt-5.2",
    displayName: "OpenAI: GPT-5.2",
    hasVision: true,
    price: {
      input: 1.75 * 9,
      output: 14 * 9,
      webSearch: 10 * 9,
    },
    maxOutputTokens: 200000,
    contextWindow: 400000,
    supportsTool: true,
  },
  {
    name: "openai/gpt-5.2-pro",
    displayName: "OpenAI: GPT-5.2 Pro",
    hasVision: true,
    price: {
      input: 21 * 9,
      output: 168 * 9,
      webSearch: 10 * 9,
    },
    maxOutputTokens: 200000,
    contextWindow: 400000,
    supportsTool: true,
  },
  {
    name: "openai/gpt-5.2-chat",
    displayName: "OpenAI: GPT-5.2 Chat",
    hasVision: true,
    price: {
      input: 1.75 * 9,
      output: 14 * 9,
      webSearch: 10 * 9,
    },
    maxOutputTokens: 128000,
    contextWindow: 128000,
    supportsTool: true,
  },

  // --- Google Models (Gemini) ---
  {
    name: "google/gemini-2.5-pro",
    displayName: "Google: Gemini 2.5 Pro",
    hasVision: true,
    price: {
      input: 1.25 * 9,
      output: 10 * 9,
      cachingRead: 0.31 * 9,
      cachingWrite: 1.625 * 9,
    },
    maxOutputTokens: 65500,
    contextWindow: 1050000,
    supportsTool: true,
  },
  {
    name: "google/gemini-3-pro-preview",
    displayName: "Google: Gemini 3 Pro Preview",
    hasVision: true,
    maxOutputTokens: 65500,
    contextWindow: 1048576,
    supportsTool: true,
    price: {
      input: 2 * 9,
      output: 12 * 9,
      cachingRead: 0.2 * 9,
      cachingWrite: 2.375 * 9,
    },
    pricingStrategy: {
      type: "tiered_context",
      tiers: [
        {
          minContext: 200001,
          price: {
            input: 4 * 9,
            output: 18 * 9,
            cachingRead: 0.4 * 9,
            cachingWrite: 4.375 * 9,
          },
        },
      ],
    },
  },

  // --- Anthropic Models (Claude) ---
  {
    name: "anthropic/claude-haiku-4.5",
    displayName: "Anthropic: Claude Haiku 4.5",
    hasVision: true,
    price: {
      input: 1 * 9,
      output: 5 * 9,
      webSearch: 10 * 9,
    },
    maxOutputTokens: 32000,
    contextWindow: 200000,
    supportsTool: true,
  },
  {
    name: "anthropic/claude-opus-4.5",
    displayName: "Anthropic: Claude Opus 4.5",
    hasVision: true,
    price: {
      input: 5 * 9,
      output: 25 * 9,
      webSearch: 10 * 9,
    },
    maxOutputTokens: 32000,
    contextWindow: 200000,
    supportsTool: true,
  },
  {
    name: "anthropic/claude-opus-4.5:online",
    displayName: "Anthropic: Claude Opus 4.5 (Online)",
    hasVision: true,
    price: {
      input: 5 * 10,
      output: 25 * 10,
      webSearch: 10 * 10,
    },
    maxOutputTokens: 32000,
    contextWindow: 200000,
    supportsTool: true,
  },
  {
    name: "anthropic/claude-sonnet-4.5",
    displayName: "Anthropic: Claude Sonnet 4.5",
    hasVision: true,
    maxOutputTokens: 64000,
    contextWindow: 1000000,
    supportsTool: true,
    pricePerImage: 4.8 * 9,
    price: {
      input: 3 * 9,
      output: 15 * 9,
      webSearch: 10 * 9,
      cachingRead: 0.3 * 9,
      cachingWrite: 3.75 * 9,
    },
    pricingStrategy: {
      type: "tiered_context",
      tiers: [
        {
          minContext: 200001,
          price: {
            input: 6 * 9,
            output: 22.5 * 9,
            webSearch: 10 * 9,
            cachingRead: 0.6 * 9,
            cachingWrite: 7.5 * 9,
          },
        },
      ],
    },
  },
  {
    name: "anthropic/claude-sonnet-4.5:online",
    displayName: "Anthropic: Claude Sonnet 4.5 (Online)",
    hasVision: true,
    maxOutputTokens: 64000,
    contextWindow: 1000000,
    supportsTool: true,
    pricePerImage: 4.8 * 10,
    price: {
      input: 3 * 10,
      output: 15 * 10,
      webSearch: 10 * 10,
      cachingRead: 0.3 * 10,
      cachingWrite: 3.75 * 10,
    },
    pricingStrategy: {
      type: "tiered_context",
      tiers: [
        {
          minContext: 200001,
          price: {
            input: 6 * 10,
            output: 22.5 * 10,
            webSearch: 10 * 10,
            cachingRead: 0.6 * 10,
            cachingWrite: 7.5 * 10,
          },
        },
      ],
    },
  },

  // --- Qwen Models ---
  {
    name: "qwen/qwen3-max",
    displayName: "Qwen: Qwen3 Max",
    hasVision: false,
    price: {
      input: 1.2 * 9,
      output: 6 * 9,
      cachingRead: 0.24 * 9,
    },
    maxOutputTokens: 32800,
    contextWindow: 256000,
    supportsTool: true,
  },
  {
    name: "qwen/qwen3-vl-235b-a22b-thinking",
    displayName: "Qwen: Qwen3 VL 235B A22B Thinking",
    hasVision: true,
    price: {
      input: 0.3 * 9,
      output: 1.2 * 9,
    },
    maxOutputTokens: 32800,
    contextWindow: 262144,
    supportsTool: true,
  },

  // --- MiniMax Models ---
  {
    name: "minimax/minimax-m2",
    displayName: "MiniMax: MiniMax M2",
    hasVision: false,
    price: {
      input: 0.15 * 9,
      output: 0.45 * 9,
    },
    maxOutputTokens: 196608,
    contextWindow: 196608,
    supportsTool: true,
  },

  // --- Mistral Models ---
  {
    name: "mistralai/ministral-14b-2512",
    displayName: "Mistral: Ministral 3 14B 2512",
    hasVision: false,
    price: {
      input: 0.2 * 9,
      output: 0.2 * 9,
    },
    maxOutputTokens: 262144,
    contextWindow: 262144,
    supportsTool: true,
  },
  {
    name: "mistralai/mistral-large-2512",
    displayName: "Mistral: Mistral Large 3 2512",
    hasVision: true,
    price: {
      input: 0.5 * 9,
      output: 1.5 * 9,
    },
    maxOutputTokens: 262144,
    contextWindow: 262144,
    supportsTool: true,
  },
  {
    name: "mistralai/devstral-2512:free",
    displayName: "Mistral: Devstral 2 2512 (free)",
    hasVision: false,
    price: {
      input: 0,
      output: 0,
    },
    maxOutputTokens: 262144,
    contextWindow: 262144,
    supportsTool: true,
  },

  // --- xAI Models ---
  {
    name: "x-ai/grok-4.1-fast",
    displayName: "xAI: Grok 4.1 Fast",
    hasVision: true,
    price: {
      input: 0.2 * 9,
      output: 0.5 * 9,
    },
    maxOutputTokens: 65536,
    contextWindow: 2000000,
    supportsTool: true,
  },

  // --- EssentialAI Models ---
  {
    name: "essentialai/rnj-1-instruct",
    displayName: "EssentialAI: Rnj 1 Instruct",
    hasVision: false,
    price: {
      input: 0.15 * 9,
      output: 0.15 * 9,
    },
    maxOutputTokens: 8192,
    contextWindow: 32768,
    supportsTool: true,
  },
];
