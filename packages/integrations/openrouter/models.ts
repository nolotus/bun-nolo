export const openrouterModels = [
  {
    name: "openai/o3-mini-high",
    displayName: "O3 Mini High",
    hasVision: false,
    price: { input: 8.8, output: 32.32 },
    maxOutputTokens: "128k",
    contextWindow: "200k",
    supportsTool: true,
  },
  {
    name: "cognitivecomputations/dolphin3.0-mistral-24b",
    displayName: "Dolphin 3.0 Mistral 24b",
    hasVision: false,
    price: { input: 0, output: 0 },
    maxOutputTokens: "128k",
    contextWindow: "32768", // 更新为与其他24b模型相同的上下文窗口大小。
    supportsTool: true,
  },
  {
    name: "cognitivecomputations/dolphin3.0-r1-mistral-24b",
    displayName: "Dolphin 3.0 R1 Mistral 24b",
    hasVision: false,
    price: { input: 0, output: 0 },
    maxOutputTokens: "128k",
    contextWindow: "32768", // 已经是正确的上下文窗口大小，无需更改。
    supportsTool: true,
  },
];
