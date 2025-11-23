// File: integrations/openrouter/ai/models.js

export const openrouterModels = [
  // --- Anthropic Models ---
  {
    name: "anthropic/claude-haiku-4.5",
    displayName: "Anthropic: Claude Haiku 4.5",
    hasVision: true,
    price: {
      input: 1 * 11,
      output: 5 * 11,
      webSearch: 10 * 11,
    },
    maxOutputTokens: 32000,
    contextWindow: 200000,
    supportsTool: true,
  },
  {
    name: "anthropic/claude-opus-4.1",
    displayName: "Anthropic: Claude Opus 4.1",
    hasVision: true,
    price: {
      input: 15 * 11,
      output: 75 * 11,
      webSearch: 10 * 11,
      cachingRead: 1.5 * 11,
      cachingWrite: 18.75 * 11,
    },
    maxOutputTokens: 32000,
    contextWindow: 200000,
    supportsTool: true,
    pricePerImage: 24 * 11,
  },
  {
    name: "anthropic/claude-opus-4.1:online",
    displayName: "Anthropic: Claude Opus 4.1 (Online)",
    hasVision: true,
    price: {
      input: 15 * 13,
      output: 75 * 13,
      webSearch: 10 * 13,
      cachingRead: 1.5 * 13,
      cachingWrite: 18.75 * 13,
    },
    maxOutputTokens: 32000,
    contextWindow: 200000,
    supportsTool: true,
    pricePerImage: 24 * 13,
  },

  // =================================================================
  // [UPDATED] Anthropic: Claude Sonnet 4.5 (Tiered Pricing)
  // =================================================================
  {
    name: "anthropic/claude-sonnet-4.5",
    displayName: "Anthropic: Claude Sonnet 4.5",
    hasVision: true,
    maxOutputTokens: 64000,
    contextWindow: 1000000,
    supportsTool: true,
    pricePerImage: 4.8 * 11,

    // Tier 1: Context ≤ 200K (Base Prices * 11)
    price: {
      input: 3 * 11,
      output: 15 * 11,
      webSearch: 10 * 11,
      cachingRead: 0.3 * 11,
      cachingWrite: 3.75 * 11,
    },

    // Tier 2: Context > 200K (High Tier Prices * 11)
    pricingStrategy: {
      type: "tiered_context",
      tiers: [
        {
          minContext: 200001,
          price: {
            input: 6 * 11,
            output: 22.5 * 11,
            webSearch: 10 * 11,
            cachingRead: 0.6 * 11,
            cachingWrite: 7.5 * 11,
          },
        },
      ],
    },
  },

  // =================================================================
  // [UPDATED] Anthropic: Claude Sonnet 4.5 Online (Tiered Pricing)
  // =================================================================
  {
    name: "anthropic/claude-sonnet-4.5:online",
    displayName: "Anthropic: Claude Sonnet 4.5 (Online)",
    hasVision: true,
    maxOutputTokens: 64000,
    contextWindow: 1000000,
    supportsTool: true,
    pricePerImage: 4.8 * 13,

    // Tier 1: Context ≤ 200K (Base Prices * 13)
    price: {
      input: 3 * 13,
      output: 15 * 13,
      webSearch: 10 * 13,
      cachingRead: 0.3 * 13,
      cachingWrite: 3.75 * 13,
    },

    // Tier 2: Context > 200K (High Tier Prices * 13)
    pricingStrategy: {
      type: "tiered_context",
      tiers: [
        {
          minContext: 200001,
          price: {
            input: 6 * 13,
            output: 22.5 * 13,
            webSearch: 10 * 13,
            cachingRead: 0.6 * 13,
            cachingWrite: 7.5 * 13,
          },
        },
      ],
    },
  },

  // --- Google Models ---
  {
    name: "google/gemini-2.5-pro",
    displayName: "Google: Gemini 2.5 Pro",
    hasVision: true,
    price: {
      input: 1.25 * 11,
      output: 10 * 11,
      cachingRead: 0.31 * 11,
      cachingWrite: 1.625 * 11,
    },
    maxOutputTokens: 65500,
    contextWindow: 1050000,
    supportsTool: true,
  },

  // --- MiniMax Models ---
  {
    name: "minimax/minimax-m2",
    displayName: "MiniMax: MiniMax M2",
    hasVision: false,
    price: {
      input: 0.15 * 11,
      output: 0.45 * 11,
    },
    maxOutputTokens: 196608,
    contextWindow: 196608,
    supportsTool: true,
  },

  // --- MoonshotAI Models ---
  {
    name: "moonshotai/kimi-k2-thinking:nitro",
    displayName: "MoonshotAI: Kimi K2 Thinking :nitro",
    hasVision: false,
    price: {
      input: 0.6 * 11,
      output: 2.5 * 11,
      cachingRead: 0.15 * 11,
    },
    maxOutputTokens: 262144,
    contextWindow: 262144,
    supportsTool: false,
  },

  // --- OpenAI Models ---
  {
    name: "openai/gpt-5",
    displayName: "OpenAI: GPT-5",
    hasVision: true,
    price: {
      input: 1.25 * 11,
      output: 10 * 11,
      webSearch: 10 * 11,
    },
    maxOutputTokens: 200000,
    contextWindow: 400000,
    supportsTool: true,
  },
  {
    name: "openai/gpt-5.1",
    displayName: "OpenAI: GPT-5.1",
    hasVision: true,
    price: {
      input: 1.25 * 11,
      output: 10 * 11,
      webSearch: 10 * 11,
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
      input: 1.25 * 11,
      output: 10 * 11,
      webSearch: 10 * 11,
    },
    maxOutputTokens: 200000,
    contextWindow: 400000,
    supportsTool: true,
  },
  {
    name: "openai/gpt-5:online",
    displayName: "OpenAI: GPT-5 (Online)",
    hasVision: true,
    price: {
      input: 1.25 * 13,
      output: 10 * 13,
      webSearch: 10 * 13,
    },
    maxOutputTokens: 200000,
    contextWindow: 400000,
    supportsTool: true,
  },
  {
    name: "openai/gpt-5-mini",
    displayName: "OpenAI: GPT-5 Mini",
    hasVision: true,
    price: {
      input: 0.25 * 11,
      output: 2 * 11,
      webSearch: 10 * 11,
    },
    maxOutputTokens: 200000,
    contextWindow: 400000,
    supportsTool: true,
  },
  {
    name: "openai/gpt-5-mini:online",
    displayName: "OpenAI: GPT-5 Mini (Online)",
    hasVision: true,
    price: {
      input: 0.25 * 13,
      output: 2 * 13,
      webSearch: 10 * 13,
    },
    maxOutputTokens: 200000,
    contextWindow: 400000,
    supportsTool: true,
  },
  {
    name: "openai/gpt-5-pro",
    displayName: "OpenAI: GPT-5 Pro",
    hasVision: true,
    price: {
      input: 15 * 11,
      output: 120 * 11,
      webSearch: 10 * 11,
    },
    maxOutputTokens: 200000,
    contextWindow: 400000,
    supportsTool: true,
  },
  {
    name: "openai/gpt-5-pro:online",
    displayName: "OpenAI: GPT-5 Pro (Online)",
    hasVision: true,
    price: {
      input: 15 * 13,
      output: 120 * 13,
      webSearch: 10 * 13,
    },
    maxOutputTokens: 200000,
    contextWindow: 400000,
    supportsTool: true,
  },
  {
    name: "openai/o3-deep-research",
    displayName: "OpenAI: o3 Deep Research",
    hasVision: true,
    price: {
      input: 10 * 11,
      output: 40 * 11,
      webSearch: 10 * 11,
    },
    maxOutputTokens: 200000,
    contextWindow: 200000,
    supportsTool: true,
    pricePerImage: 7.65 * 11,
  },
  {
    name: "openai/o4-mini-deep-research",
    displayName: "OpenAI: o4 Mini Deep Research",
    hasVision: true,
    price: {
      input: 2 * 11,
      output: 8 * 11,
      webSearch: 10 * 11,
    },
    maxOutputTokens: 200000,
    contextWindow: 200000,
    supportsTool: true,
    pricePerImage: 1.53 * 11,
  },

  // --- Qwen Models ---
  {
    name: "qwen/qwen3-max",
    displayName: "Qwen: Qwen3 Max",
    hasVision: false,
    price: {
      input: 1.2 * 11,
      output: 6 * 11,
      cachingRead: 0.24 * 11,
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
      input: 0.3 * 11,
      output: 1.2 * 11,
    },
    maxOutputTokens: 32800,
    contextWindow: 262144,
    supportsTool: true,
  },

  // --- xAI Models ---
  {
    name: "x-ai/grok-4.1-fast",
    displayName: "xAI: Grok 4.1 Fast",
    hasVision: true,
    price: {
      input: 0,
      output: 0,
    },
    maxOutputTokens: 65536,
    contextWindow: 2000000,
    supportsTool: true,
  },
];
