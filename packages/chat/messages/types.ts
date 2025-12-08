// chat/messages/types.ts

// ========== 角色 ==========
export type MessageRole = "user" | "system" | "assistant" | "tool";

// ========== OpenAI 风格的 content ==========
export type OpenAIImageUrl =
  | `http${string}`
  | `https${string}`
  | `data:image/${string};base64,${string}`;

export interface OpenAIImageContent {
  type: "image_url";
  image_url: {
    url: OpenAIImageUrl;
    // 若未来需要，可以加 detail 等字段
    detail?: "low" | "high" | "auto";
  };
}

export interface OpenAITextContent {
  type: "text";
  text: string;
}

// OpenAI 最终一条消息的 content 元素
export type MessageContentPart = OpenAITextContent | OpenAIImageContent;

// 对外使用的 Content 类型：要么是纯字符串，要么是数组（多段 text/image）
export type Content = string | MessageContentPart[];

// ========== Tool 调用快照（结构化）==========
// 先简单定义在这里，后面可以单独抽到 ai/tools/types.ts 再 import
export interface ToolErrorPayload {
  type: string; // Error / ValidationError / NetworkError ...
  message: string;
  code?: string;
  retryable?: boolean;
}

export interface ToolPayload {
  toolName: string; // 规范化后的工具名（canonicalName）
  status: "pending" | "running" | "succeeded" | "failed";
  input: any; // clean + JSON.parse 后的 arguments
  rawToolCall?: any; // 模型原始 tool_call（含原始 arguments 字符串）
  rawResult?: any; // executor 返回的原始数据
  error?: ToolErrorPayload; // 失败时的结构化错误信息
  toolRunId?: string; // 可选：和前端 toolRunSlice 对应
  startedAt?: number;
  finishedAt?: number;
}

// ========== Message 主类型 ==========

export interface Message {
  role: MessageRole;
  content: Content;

  thinkContent?: string; // thinking 模式的内容（<think> 里抽出来的）
  image?: string;
  images?: string[]; // Ollama 兼容字段（可以保留兼容）

  id: string;
  dbKey: string; // DB 主键（DIALOG-{dialogId}-msg-{messageId}）

  cybotId?: string;
  cybotKey?: string;

  isStreaming?: boolean;
  userId?: string;
  usage?: any;

  controller?: AbortController;

  // ========= Tool 扩展字段 =========

  // 规范化工具名（如 "search_docs"），便于 UI / 分析
  toolName?: string;

  // 工具调用快照（核心新增字段，后面会在 thunk 里写入）
  toolPayload?: ToolPayload;

  // 调用链关系：这条 tool 消息是由哪条 assistant / user 消息触发的
  parentMessageId?: string;

  // 和 toolRunSlice 对应的运行时 id，可选
  toolRunId?: string;
}
