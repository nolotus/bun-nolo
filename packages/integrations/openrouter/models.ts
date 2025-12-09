export const openrouterModels = [
  // --- MoonshotAI Models (Kimi) ---
  {
    name: "moonshotai/kimi-k2-thinking",
    displayName: "MoonshotAI: Kimi K2 Thinking",
    hasVision: false,
    price: {
      input: 0.6 * 9, // 11→9
      output: 2.5 * 9, // 11→9
      cachingRead: 0.15 * 9, // 11→9
    },
    maxOutputTokens: 262144,
    contextWindow: 262144,
    supportsTool: false,
  },

  // --- OpenAI Models (GPT) ---
  {
    name: "openai/gpt-5",
    displayName: "OpenAI: GPT-5",
    hasVision: true,
    price: {
      input: 1.25 * 9, // 11→9
      output: 10 * 9, // 11→9
      webSearch: 10 * 9, // 11→9
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
      input: 1.25 * 9, // 11→9
      output: 10 * 9, // 11→9
      webSearch: 10 * 9, // 11→9
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
      input: 1.25 * 9, // 11→9
      output: 10 * 9, // 11→9
      webSearch: 10 * 9, // 11→9
    },
    maxOutputTokens: 200000,
    contextWindow: 400000,
    supportsTool: true,
  },
  // =================================================================
  // [NEW] OpenAI: GPT-5.1-Codex-Max
  // =================================================================
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
    name: "openai/gpt-5:online",
    displayName: "OpenAI: GPT-5 (Online)",
    hasVision: true,
    price: {
      input: 1.25 * 10, // 13→10
      output: 10 * 10, // 13→10
      webSearch: 10 * 10, // 13→10
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
      input: 0.25 * 9, // 11→9
      output: 2 * 9, // 11→9
      webSearch: 10 * 9, // 11→9
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
      input: 0.25 * 10, // 13→10
      output: 2 * 10, // 13→10
      webSearch: 10 * 10, // 13→10
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
      input: 15 * 9, // 11→9
      output: 120 * 9, // 11→9
      webSearch: 10 * 9, // 11→9
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
      input: 15 * 10, // 13→10
      output: 120 * 10, // 13→10
      webSearch: 10 * 10, // 13→10
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
      input: 10 * 9, // 11→9
      output: 40 * 9, // 11→9
      webSearch: 10 * 9, // 11→9
    },
    maxOutputTokens: 200000,
    contextWindow: 200000,
    supportsTool: true,
    pricePerImage: 7.65 * 9, // 11→9
  },

  // --- Google Models (Gemini) ---
  {
    name: "google/gemini-2.5-pro",
    displayName: "Google: Gemini 2.5 Pro",
    hasVision: true,
    price: {
      input: 1.25 * 9, // 11→9
      output: 10 * 9, // 11→9
      cachingRead: 0.31 * 9, // 11→9
      cachingWrite: 1.625 * 9, // 11→9
    },
    maxOutputTokens: 65500,
    contextWindow: 1050000,
    supportsTool: true,
  },
  // =================================================================
  // [NEW] Google: Gemini 3 Pro Preview (Released Nov 18, 2025)
  // =================================================================
  {
    name: "google/gemini-3-pro-preview",
    displayName: "Google: Gemini 3 Pro Preview",
    hasVision: true,
    maxOutputTokens: 65500,
    contextWindow: 1048576,
    supportsTool: true,

    // Tier 1: Context ≤ 200K
    price: {
      input: 2 * 9, // ≤200K: $2/M
      output: 12 * 9, // ≤200K: $12/M
      cachingRead: 0.2 * 9, // ≤200K: $0.20/M
      cachingWrite: 2.375 * 9, // ≤200K: $2.375/M
    },

    // Tier 2: Context > 200K
    pricingStrategy: {
      type: "tiered_context",
      tiers: [
        {
          minContext: 200001,
          price: {
            input: 4 * 9, // >200K: $4/M
            output: 18 * 9, // >200K: $18/M
            cachingRead: 0.4 * 9, // >200K: $0.40/M
            cachingWrite: 4.375 * 9, // >200K: $4.375/M
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
      input: 1 * 9, // 11→9
      output: 5 * 9, // 11→9
      webSearch: 10 * 9, // 11→9
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
      input: 15 * 9, // 11→9
      output: 75 * 9, // 11→9
      webSearch: 10 * 9, // 11→9
      cachingRead: 1.5 * 9, // 11→9
      cachingWrite: 18.75 * 9, // 11→9
    },
    maxOutputTokens: 32000,
    contextWindow: 200000,
    supportsTool: true,
    pricePerImage: 24 * 9, // 11→9
  },
  {
    name: "anthropic/claude-opus-4.1:online",
    displayName: "Anthropic: Claude Opus 4.1 (Online)",
    hasVision: true,
    price: {
      input: 15 * 10, // 13→10
      output: 75 * 10, // 13→10
      webSearch: 10 * 10, // 13→10
      cachingRead: 1.5 * 10, // 13→10
      cachingWrite: 18.75 * 10, // 13→10
    },
    maxOutputTokens: 32000,
    contextWindow: 200000,
    supportsTool: true,
    pricePerImage: 24 * 10, // 13→10
  },
  // =================================================================
  // [NEW] Anthropic: Claude Opus 4.5 (Released Nov 24, 2025)
  // =================================================================
  {
    name: "anthropic/claude-opus-4.5",
    displayName: "Anthropic: Claude Opus 4.5",
    hasVision: true,
    price: {
      input: 5 * 9, // 普通版保持9
      output: 25 * 9, // 普通版保持9
      webSearch: 10 * 9, // 普通版保持9
    },
    maxOutputTokens: 32000,
    contextWindow: 200000,
    supportsTool: true,
  },
  // =================================================================
  // [NEW] Anthropic: Claude Opus 4.5 Online (Released Nov 24, 2025)
  // =================================================================
  {
    name: "anthropic/claude-opus-4.5:online",
    displayName: "Anthropic: Claude Opus 4.5 (Online)",
    hasVision: true,
    price: {
      input: 5 * 10, // online版保持10
      output: 25 * 10, // online版保持10
      webSearch: 10 * 10, // online版保持10
    },
    maxOutputTokens: 32000,
    contextWindow: 200000,
    supportsTool: true,
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
    pricePerImage: 4.8 * 9, // 11→9

    // Tier 1: Context ≤ 200K
    price: {
      input: 3 * 9, // 11→9
      output: 15 * 9, // 11→9
      webSearch: 10 * 9, // 11→9
      cachingRead: 0.3 * 9, // 11→9
      cachingWrite: 3.75 * 9, // 11→9
    },

    // Tier 2: Context > 200K
    pricingStrategy: {
      type: "tiered_context",
      tiers: [
        {
          minContext: 200001,
          price: {
            input: 6 * 9, // 11→9
            output: 22.5 * 9, // 11→9
            webSearch: 10 * 9, // 11→9
            cachingRead: 0.6 * 9, // 11→9
            cachingWrite: 7.5 * 9, // 11→9
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
    pricePerImage: 4.8 * 10, // 13→10

    // Tier 1: Context ≤ 200K
    price: {
      input: 3 * 10, // 13→10
      output: 15 * 10, // 13→10
      webSearch: 10 * 10, // 13→10
      cachingRead: 0.3 * 10, // 13→10
      cachingWrite: 3.75 * 10, // 13→10
    },

    // Tier 2: Context > 200K
    pricingStrategy: {
      type: "tiered_context",
      tiers: [
        {
          minContext: 200001,
          price: {
            input: 6 * 10, // 13→10
            output: 22.5 * 10, // 13→10
            webSearch: 10 * 10, // 13→10
            cachingRead: 0.6 * 10, // 13→10
            cachingWrite: 7.5 * 10, // 13→10
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
      input: 1.2 * 9, // 11→9
      output: 6 * 9, // 11→9
      cachingRead: 0.24 * 9, // 11→9
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
      input: 0.3 * 9, // 11→9
      output: 1.2 * 9, // 11→9
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
      input: 0.15 * 9, // 11→9
      output: 0.45 * 9, // 11→9
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
  // Created Dec 7, 2025
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
