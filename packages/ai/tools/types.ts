// ai/tools/types.ts

export interface ToolErrorPayload {
  type: string; // Error / ValidationError / NetworkError ...
  message: string;
  code?: string;
  retryable?: boolean;
}

export interface ToolPayload {
  toolName: string; // 规范化后的名字 canonicalName
  status: "pending" | "running" | "succeeded" | "failed";
  input: any; // clean + JSON.parse 后的 arguments
  rawToolCall?: any; // 模型原始 tool_call
  rawResult?: any; // executor 返回的原始数据
  error?: ToolErrorPayload; // 失败时的结构化错误
  toolRunId?: string; // 可选：与 toolRunSlice 对应
  startedAt?: number;
  finishedAt?: number;
}
