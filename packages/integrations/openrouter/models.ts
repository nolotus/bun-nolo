export const openrouterModels = [
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
  // 新添加的变体：Anthropic: Claude Opus 4.1 (Online)
  {
    name: "anthropic/claude-opus-4.1:online",
    displayName: "Anthropic: Claude Opus 4.1 (Online)",
    hasVision: true,
    price: {
      input: 15 * 12,
      output: 75 * 12, // 调整为 *12：input 180, output 900
      webSearch: 10 * 12, // per 1k searches (Claude API)
    },
    maxOutputTokens: 32000,
    contextWindow: 200000,
    supportsTool: true,
    pricePerImage: 24 * 12, // 调整为 *12：288
    cache: {
      read: 1.5 * 12, // 调整为 *12：18
      write: 18.75 * 12, // 调整为 *12：225
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
  // 新添加的变体：Anthropic: Claude Sonnet 4.5 (Online)
  {
    name: "anthropic/claude-sonnet-4.5:online",
    displayName: "Anthropic: Claude Sonnet 4.5 (Online)",
    hasVision: true,
    price: {
      input: 3 * 12,
      output: 15 * 12, // 基于规格 ≤200K：input $3 *12=36, output $15 *12=180 (>200K 时可扩展为 $6/$22.50 *12=72/270)
      webSearch: 10 * 12, // per 1k searches (Claude API)
    },
    maxOutputTokens: 64000,
    contextWindow: 1000000,
    supportsTool: true,
    pricePerImage: 4.8 * 12, // 保持与 sonnet-4 一致：57.6
    cache: {
      read: 0.3 * 12, // 基于规格 ≤200K：$0.30 *12=3.6 (>200K 时 $0.60 *12=7.2)
      write: 3.75 * 12, // 基于规格 ≤200K：$3.75 *12=45 (>200K 时 $7.50 *12=90)
    },
  },
  {
    name: "minimax/minimax-m1",
    displayName: "MiniMax: MiniMax M1",
    hasVision: false,
    price: { input: 0.3 * 11, output: 1.65 * 11 }, // 调整为 *11：input 3.3, output 18.15
    maxOutputTokens: 1000000,
    contextWindow: 1000000,
    supportsTool: true,
  },
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
  // 新添加的模型：OpenAI: GPT-5 Pro (Created Oct 6, 2025)
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
  // 新添加的变体：OpenAI: GPT-5 Pro (Online)
  {
    name: "openai/gpt-5-pro:online",
    displayName: "OpenAI: GPT-5 Pro (Online)",
    hasVision: true,
    price: {
      input: 15 * 12,
      output: 120 * 12, // 调整为 *12：input 180, output 1440 (基于 $15/M input, $120/M output)
      webSearch: 10 * 12, // $10 / 1k calls (OpenAI)
    },
    maxOutputTokens: 200000,
    contextWindow: 400000,
    supportsTool: true,
    // pricePerImage 和 cache 未指定，因此省略
  },
  // 新添加的模型：OpenAI: GPT-5 (Created Aug 7, 2025)
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
  // 新添加的变体：OpenAI: GPT-5 (Online)
  {
    name: "openai/gpt-5:online",
    displayName: "OpenAI: GPT-5 (Online)",
    hasVision: true,
    price: {
      input: 1.25 * 12,
      output: 10 * 12, // 调整为 *12：input 15, output 120 (基于 $1.25/M input, $10/M output)
      webSearch: 10 * 12, // $10 / 1k calls (OpenAI)
    },
    maxOutputTokens: 200000,
    contextWindow: 400000,
    supportsTool: true,
    // pricePerImage 和 cache 未指定，因此省略
  },
  // 新添加的模型：OpenAI: GPT-5 Mini (Created Aug 7, 2025)
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
  // 新添加的变体：OpenAI: GPT-5 Mini (Online)
  {
    name: "openai/gpt-5-mini:online",
    displayName: "OpenAI: GPT-5 Mini (Online)",
    hasVision: true,
    price: {
      input: 0.25 * 12,
      output: 2 * 12, // 调整为 *12：input 3, output 24 (基于 $0.25/M input, $2/M output)
      webSearch: 10 * 12, // $10 / 1k calls (OpenAI)
    },
    maxOutputTokens: 200000,
    contextWindow: 400000,
    supportsTool: true,
    // pricePerImage 和 cache 未指定，因此省略
  },
];
