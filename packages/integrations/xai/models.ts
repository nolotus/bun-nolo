import { Model } from "ai/llm/types";

export const xaiModels: Model[] = [
  {
    name: "grok-3-latest",
    displayName: "Grok3",
    hasVision: false,
    contextWindow: 131072,
    price: { input: 1, output: 1 }, // 真实价格：input: 3 * 8, output: 15 * 8，现在特价改为1
    fnCall: true, // 支持函数调用
    jsonOutput: true, // 支持结构化输出
  },
  {
    name: "grok-3-fast-latest",
    displayName: "Grok3 Fast Beta",
    hasVision: false,
    contextWindow: 131072,
    price: { input: 1, output: 1 }, // 真实价格：input: 5 * 8, output: 25 * 8，现在特价改为1
    fnCall: true, // 支持函数调用
    jsonOutput: true, // 支持结构化输出
  },
  {
    name: "grok-3-mini-latest",
    displayName: "Grok3 Mini Beta",
    hasVision: false,
    contextWindow: 131072,
    price: { input: 1, output: 1 }, // 真实价格：input: 0.3 * 8, output: 0.5 * 8，现在特价改为1
    fnCall: true, // 支持函数调用
    jsonOutput: true, // 支持结构化输出
  },
  {
    name: "grok-3-mini-fast-latest",
    displayName: "Grok3 Mini Fast Beta",
    hasVision: false,
    contextWindow: 131072,
    price: { input: 1, output: 1 }, // 真实价格：input: 0.6 * 8, output: 4 * 8，现在特价改为1
    fnCall: true, // 支持函数调用
    jsonOutput: true, // 支持结构化输出
  },
];
