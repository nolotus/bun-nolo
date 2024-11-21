export interface Message {
  role: MessageRole;
  content: string;
  image?: string;
  id: string;
}
export interface MessageSliceState {
  ids: string[] | null;
  isStopped: boolean;
  streamMessages: Message[];
}
type MessageRole = "user" | "system" | "assistant";
