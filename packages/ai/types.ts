// types.ts

import { MessageRole } from "chat/messages/types";
import { DataType } from "create/types";

export interface FrontEndRequestBody {
  type: "text" | "image" | "audio";
  model?: string;
  messages?: Array<{
    role: MessageRole;
    content: string;
  }>;
  prompt?: string;
  n?: number;
  size?: string;
  file?: Buffer;
}

export type Dialog = {
  dialogType: "send" | "receive";
  model: string;
  length: number;
};

export type ModeType =
  | "text"
  | "image"
  | "stream"
  | "audio"
  | "speech"
  | "surf"
  | "vision";

export type Message = {
  content: string;
  role: string;
};

// 创建一个请求中应该被选取的属性类型
export type RequestPayloadProperties = {
  model: string;
  presence_penalty?: number; // 如果是可选属性则添加`?`
  frequency_penalty?: number;
  top_k?: number;
  top_p?: number;
  temperature?: number;
  max_tokens?: number;
};
export interface PromptFormData {
  name: string;
  content: string;
  category?: string;
  tags?: string[];
}

export interface LLMFormData {
  name: string;
  apiStyle: string;
  api: string;
  keyName?: string;
  model: string;
}

export interface TokenStaticData {
  type: DataType.TokenStats | DataType.TokenStatistics;
  dialogType: "send" | "receive";
  model: string;
  length: number;
  userId: string;
  username: string;
  dialogId?: string;
  chatCreated?: string;
  date: Date;
}
