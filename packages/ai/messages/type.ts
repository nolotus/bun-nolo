import { ClaudeContent } from "integrations/anthropic/type";

export interface InputMessage {
  content:
    | Array<{
        text?: string;
        type: string;
        image_url?: {
          url: string;
        };
      }>
    | string;
  role: string;
}

export interface OutputMessage {
  role: string;
  content: string | ClaudeContent;
  images: string[];
}
