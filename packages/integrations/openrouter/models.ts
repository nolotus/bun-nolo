export const openrouterModels = [
  {
    name: "openai/o3-mini-high",
    displayName: "O3 Mini High",
    hasVision: false,
    price: { input: 8.8, output: 32.32 },
    maxOutputTokens: 128000,
    contextWindow: 200000,
    supportsTool: true,
  },
  {
    name: "cognitivecomputations/dolphin3.0-mistral-24b:free",
    displayName: "Dolphin 3.0 Mistral 24b",
    hasVision: false,
    price: { input: 1, output: 1 },
    maxOutputTokens: 128000,
    contextWindow: 32768,
    supportsTool: true,
  },
  {
    name: "cognitivecomputations/dolphin3.0-r1-mistral-24b:free",
    displayName: "Dolphin 3.0 R1 Mistral 24b",
    hasVision: false,
    price: { input: 1, output: 1 },
    maxOutputTokens: 128000,
    contextWindow: 32768,
    supportsTool: true,
  },
  {
    name: "openrouter/quasar-alpha",
    displayName: "Quasar Alpha",
    hasVision: false,
    price: { input: 1, output: 1 },
    maxOutputTokens: 32000,
    contextWindow: 1000000,
    supportsTool: true,
  },
  {
    name: "anthropic/claude-3.7-sonnet",
    displayName: "Anthropic: Claude 3.7 Sonnet",
    hasVision: true,
    price: { input: 3 * 8, output: 15 * 8 },
    maxOutputTokens: 200000,
    contextWindow: 200000,
    supportsTool: true,
  },
  {
    name: "qwen/qwen-2.5-72b-instruct:free",
    displayName: "Qwen 2.5 72b Instruct",
    hasVision: false,
    price: { input: 1, output: 1 },
    maxOutputTokens: 32768,
    contextWindow: 32768,
    supportsTool: true,
  },
  {
    name: "google/gemini-2.5-pro-exp-03-25:free",
    displayName: "Gemini 2.5 Pro Exp 03-25",
    hasVision: false,
    price: { input: 1, output: 1 },
    maxOutputTokens: 66000,
    contextWindow: 1000000,
    supportsTool: true,
  },
];
