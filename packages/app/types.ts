import { DataType } from "create/types";

export interface BotConfig {
  id: string;
  provider: string;
  model: string;
  prompt?: string;
  name?: string;
  [key: string]: any;
  tools?: any[];
  useServerProxy: boolean;
  apiKey?: string;
  customProviderUrl?: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string | { type: string; data: string }[];
  userId?: string;
}
export enum DialogInvocationMode {
  FIRST = "FIRST", // 总是调用列表中的第一个 cybot
  SEQUENTIAL = "SEQUENTIAL", // 按顺序轮流调用 cybot
  PARALLEL = "PARALLEL", // 同时调用所有 cybot
  ORCHESTRATED = "ORCHESTRATED", // 使用提示词和 AI 决定调用哪个 cybot
}

export interface DialogConfig {
  id: string; // 对话的唯一标识符/路径
  type: DataType.DIALOG; // 数据类型标记
  title: string; // 对话标题
  cybots: string[]; // 参与对话的 Cybot ID 列表
  mode: DialogInvocationMode; // 调用模式 (原 invocationMode)
  orchPrompt?: string; // 编排提示词 (原 orchestratorPrompt), 仅在 ORCHESTRATED 模式下使用 (可选)
  createdAt: string; // 创建时间戳
  updatedAt: string; // 最后更新时间戳
}
