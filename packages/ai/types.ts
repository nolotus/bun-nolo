// types.ts

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
