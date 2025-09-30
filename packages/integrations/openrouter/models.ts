export const openrouterModels = [
  {
    name: "anthropic/claude-opus-4",
    displayName: "Anthropic: Claude Opus 4",
    hasVision: true,
    price: { input: 15 * 11, output: 75 * 11 }, // 调整为 *11：input 165, output 825
    maxOutputTokens: 200000,
    contextWindow: 200000,
    supportsTool: true,
    pricePerImage: 24 * 11, // 调整为 *11：264（原为 24 * 8，现在统一 *11）
  },
  {
    name: "anthropic/claude-opus-4.1",
    displayName: "Anthropic: Claude Opus 4.1",
    hasVision: true,
    price: { input: 15 * 11, output: 75 * 11 }, // 调整为 *11：input 165, output 825
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
    name: "anthropic/claude-sonnet-4",
    displayName: "Anthropic: Claude Sonnet 4",
    hasVision: true,
    price: { input: 3 * 11, output: 15 * 11 }, // 调整为 *11：input 33, output 165
    maxOutputTokens: 200000,
    contextWindow: 200000,
    supportsTool: true,
    pricePerImage: 4.8 * 11, // 调整为 *11：52.8（原为 4.8 * 8，现在统一 *11）
  },
  {
    name: "anthropic/claude-sonnet-4.5",
    displayName: "Anthropic: Claude Sonnet 4.5",
    hasVision: true,
    price: { input: 3 * 11, output: 15 * 11 }, // 基于规格 ≤200K：input $3 *11=33, output $15 *11=165 (>200K 时可扩展为 $6/$22.50 *11=66/247.5)
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
];
