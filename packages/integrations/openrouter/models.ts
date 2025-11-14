export const openrouterModels = [
  // --- Anthropic Models ---
  {
    name: "anthropic/claude-haiku-4.5",
    displayName: "Anthropic: Claude Haiku 4.5",
    hasVision: true,
    price: {
      input: 1 * 11,
      output: 5 * 11, // 调整为 *11：input 11, output 55 (基于 $1/M input, $5/M output)
      webSearch: 10 * 11, // per 1k searches (Claude API, 假设一致)
    },
    maxOutputTokens: 32000, // 假设与 Opus 类似
    contextWindow: 200000,
    supportsTool: true,
    // pricePerImage 未指定，因此省略；cache 未指定，因此省略
  },
  {
    name: "anthropic/claude-opus-4.1",
    displayName: "Anthropic: Claude Opus 4.1",
    hasVision: true,
    price: {
      input: 15 * 11,
      output: 75 * 11, // 调整为 *11：input 165, output 825
      webSearch: 10 * 11, // per 1k searches (Claude API)
    },
    maxOutputTokens: 32000,
    contextWindow: 200000,
    supportsTool: true,
    pricePerImage: 24 * 11, // 调整为 *11：264
    cache: {
      read: 1.5 * 11, // 调整为 *11：16.5
      write: 18.75 * 11, // 调整为 *11：206.25
    },
  },
  {
    name: "anthropic/claude-opus-4.1:online",
    displayName: "Anthropic: Claude Opus 4.1 (Online)",
    hasVision: true,
    price: {
      input: 15 * 13, // 已修改为 *13
      output: 75 * 13, // 已修改为 *13
      webSearch: 10 * 13, // 已修改为 *13
    },
    maxOutputTokens: 32000,
    contextWindow: 200000,
    supportsTool: true,
    pricePerImage: 24 * 13, // 已修改为 *13
    cache: {
      read: 1.5 * 13, // 已修改为 *13
      write: 18.75 * 13, // 已修改为 *13
    },
  },
  {
    name: "anthropic/claude-sonnet-4.5",
    displayName: "Anthropic: Claude Sonnet 4.5",
    hasVision: true,
    price: {
      input: 3 * 11,
      output: 15 * 11, // 基于规格 ≤200K：input $3 *11=33, output $15 *11=165 (>200K 时可扩展为 $6/$22.50 *11=66/247.5)
      webSearch: 10 * 11, // per 1k searches (Claude API)
    },
    maxOutputTokens: 64000, // 更新为 64K
    contextWindow: 1000000, // 1M context
    supportsTool: true,
    pricePerImage: 4.8 * 11, // 保持与 sonnet-4 一致：52.8
    cache: {
      read: 0.3 * 11, // 基于规格 ≤200K：$0.30 *11=3.3 (>200K 时 $0.60 *11=6.6)
      write: 3.75 * 11, // 基于规格 ≤200K：$3.75 *11=41.25 (>200K 时 $7.50 *11=82.5)
    },
  },
  {
    name: "anthropic/claude-sonnet-4.5:online",
    displayName: "Anthropic: Claude Sonnet 4.5 (Online)",
    hasVision: true,
    price: {
      input: 3 * 13, // 已修改为 *13
      output: 15 * 13, // 已修改为 *13
      webSearch: 10 * 13, // 已修改为 *13
    },
    maxOutputTokens: 64000,
    contextWindow: 1000000,
    supportsTool: true,
    pricePerImage: 4.8 * 13, // 保持 *13 不变
    cache: {
      read: 0.3 * 13, // 已修改为 *13
      write: 3.75 * 13, // 已修改为 *13
    },
  },

  // --- Google Models ---
  {
    name: "google/gemini-2.5-pro",
    displayName: "Google: Gemini 2.5 Pro",
    hasVision: true,
    price: { input: 1.25 * 11, output: 10 * 11 }, // 调整为 *11：input 13.75, output 110
    maxOutputTokens: 65500,
    contextWindow: 1050000,
    supportsTool: true,
    cache: {
      read: 0.31 * 11, // 调整为 *11：3.41
      write: 1.625 * 11, // 调整为 *11：17.875
    },
  },

  // --- MiniMax Models ---
  {
    name: "minimax/minimax-m2",
    displayName: "MiniMax: MiniMax M2",
    hasVision: false, // 假设 M2 不支持视觉，如果支持请修改
    price: {
      input: 0.15 * 11, // $0.15/M input * 11 = 1.65
      output: 0.45 * 11, // $0.45/M output * 11 = 4.95
    },
    maxOutputTokens: 196608,
    contextWindow: 196608,
    supportsTool: true,
  },

  // --- MoonshotAI Models ---
  {
    name: "moonshotai/kimi-k2-thinking:nitro", // 添加 :nitro 后缀
    displayName: "MoonshotAI: Kimi K2 Thinking :nitro", // 添加 :nitro 后缀
    hasVision: false, // 根据提供信息，Kimi K2 Thinking 默认不具备视觉能力，如需修改请告知
    price: {
      input: 1.15 * 11, // 已调整为 $1.15/M input tokens
      output: 8 * 11, // 已调整为 $8/M output tokens
    },
    maxOutputTokens: 262144, // 262.1K
    contextWindow: 262144, // 262.1K context
    supportsTool: false, // 根据提供信息，未提及工具支持，默认为 false
    cache: {
      read: 0.15, // 已调整为 $0.15
      // write, inputAudio, inputAudioCache 未指定，因此省略
    },
  },

  // --- OpenAI Models ---
  {
    name: "openai/gpt-5",
    displayName: "OpenAI: GPT-5",
    hasVision: true,
    price: {
      input: 1.25 * 11,
      output: 10 * 11, // 调整为 *11：input 13.75, output 110 (基于 $1.25/M input, $10/M output)
      webSearch: 10 * 11, // $10 / 1k calls (OpenAI)
    },
    maxOutputTokens: 200000,
    contextWindow: 400000,
    supportsTool: true,
    // pricePerImage 和 cache 未指定，因此省略；web search $10/K 可后续扩展 price 对象
  },
  // 新添加的 OpenAI: GPT-5.1 模型
  {
    name: "openai/gpt-5.1",
    displayName: "OpenAI: GPT-5.1",
    hasVision: true, // 假设 GPT-5.1 支持视觉
    price: {
      input: 1.25 * 11,
      output: 10 * 11,
      webSearch: 10 * 11,
    },
    maxOutputTokens: 200000, // 与 GPT-5 保持一致
    contextWindow: 400000,
    supportsTool: true, // 假设 GPT-5.1 支持工具
  },
  {
    name: "openai/gpt-5:online",
    displayName: "OpenAI: GPT-5 (Online)",
    hasVision: true,
    price: {
      input: 1.25 * 13, // 已修改为 *13
      output: 10 * 13, // 已修改为 *13
      webSearch: 10 * 13, // 已修改为 *13
    },
    maxOutputTokens: 200000,
    contextWindow: 400000,
    supportsTool: true,
    // pricePerImage 和 cache 未指定，因此省略
  },
  {
    name: "openai/gpt-5-mini",
    displayName: "OpenAI: GPT-5 Mini",
    hasVision: true,
    price: {
      input: 0.25 * 11,
      output: 2 * 11, // 调整为 *11：input 2.75, output 22 (基于 $0.25/M input, $2/M output)
      webSearch: 10 * 11, // $10 / 1k calls (OpenAI)
    },
    maxOutputTokens: 200000,
    contextWindow: 400000,
    supportsTool: true,
    // pricePerImage 和 cache 未指定，因此省略；web search $10/K 可后续扩展 price 对象
  },
  {
    name: "openai/gpt-5-mini:online",
    displayName: "OpenAI: GPT-5 Mini (Online)",
    hasVision: true,
    price: {
      input: 0.25 * 13, // 已修改为 *13
      output: 2 * 13, // 已修改为 *13
      webSearch: 10 * 13, // 已修改为 *13
    },
    maxOutputTokens: 200000,
    contextWindow: 400000,
    supportsTool: true,
    // pricePerImage 和 cache 未指定，因此省略
  },
  {
    name: "openai/gpt-5-pro",
    displayName: "OpenAI: GPT-5 Pro",
    hasVision: true,
    price: {
      input: 15 * 11,
      output: 120 * 11, // 调整为 *11：input 165, output 1320 (基于 $15/M input, $120/M output)
      webSearch: 10 * 11, // $10 / 1k calls (OpenAI)
    },
    maxOutputTokens: 200000,
    contextWindow: 400000,
    supportsTool: true,
    // pricePerImage 和 cache 未指定，因此省略；如需添加可补充
  },
  {
    name: "openai/gpt-5-pro:online",
    displayName: "OpenAI: GPT-5 Pro (Online)",
    hasVision: true,
    price: {
      input: 15 * 13, // 已修改为 *13
      output: 120 * 13, // 已修改为 *13
      webSearch: 10 * 13, // 已修改为 *13
    },
    maxOutputTokens: 200000,
    contextWindow: 400000,
    supportsTool: true,
    // pricePerImage 和 cache 未指定，因此省略
  },
  {
    name: "openai/o3-deep-research", // 修改了 name 字段，使其与 displayName 保持一致
    displayName: "OpenAI: o3 Deep Research",
    hasVision: true,
    price: {
      input: 10 * 11,
      output: 40 * 11, // 调整为 *11：input 110, output 440 (基于 $10/M input, $40/M output)
      webSearch: 10 * 11, // $10 / 1k calls (OpenAI)
    },
    maxOutputTokens: 200000,
    contextWindow: 200000,
    supportsTool: true,
    pricePerImage: 7.65 * 11, // 调整为 *11：84.15 (基于 $7.65/K input imgs，假设 per 1000 images 等价调整)
    // cache 未指定，因此省略
  },
  {
    name: "openai/o4-mini-deep-research",
    displayName: "OpenAI: o4 Mini Deep Research",
    hasVision: true,
    price: {
      input: 2 * 11,
      output: 8 * 11, // 调整为 *11：input 22, output 88 (基于 $2/M input, $8/M output)
      webSearch: 10 * 11, // $10 / 1k calls (OpenAI)
    },
    maxOutputTokens: 200000,
    contextWindow: 200000,
    supportsTool: true,
    pricePerImage: 1.53 * 11, // 调整为 *11：16.83 (基于 $1.53/K input imgs，假设 per 1000 images 等价调整)
    // cache 未指定，因此省略
  },

  // --- Qwen Models ---
  {
    name: "qwen/qwen3-max",
    displayName: "Qwen: Qwen3 Max",
    hasVision: false,
    price: { input: 1.2 * 11, output: 6 * 11 }, // 调整为 *11：input 13.2, output 66
    maxOutputTokens: 32800,
    contextWindow: 256000,
    supportsTool: true,
    cache: {
      read: 0.24 * 11, // 调整为 *11：2.64
      // write: 未指定，暂省略
    },
  },
  {
    name: "qwen/qwen3-vl-235b-a22b-thinking",
    displayName: "Qwen: Qwen3 VL 235B A22B Thinking",
    hasVision: true,
    price: {
      input: 0.3 * 11,
      output: 1.2 * 11, // 调整为 *11：input 3.3, output 13.2 (基于 $0.30/M input, $1.20/M output)
      // webSearch 未指定，因此省略
    },
    maxOutputTokens: 32800, // 假设与 Qwen3 Max 类似
    contextWindow: 262144,
    supportsTool: true,
    // pricePerImage 未指定，因此省略；cache 未指定，因此省略
  },
];
