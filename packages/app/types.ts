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
