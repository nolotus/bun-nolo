export interface Message {
  role: MessageRole;
  content: string;
  image?: string;
  id: string;
}

type MessageRole = "user" | "system" | "assistant";

interface MessageContent {
  type: string;
  text?: string;
  image_url?: {
    url: string;
  };
}

export type Content = string | MessageContent[];
