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
