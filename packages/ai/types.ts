// types.ts

import { DataType } from "create/types";

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

export interface TokenStaticData {
  type: DataType.TokenStats;
  messageType: "send" | "receive";
  model: string;
  tokenCount: number;
  userId: string;
  username: string;
  dialogId?: string;
  date: Date;
}
