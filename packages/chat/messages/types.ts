export interface Message {
  role: MessageRole;
  content: string;
  image?: string;
  id: string;
}
export interface MessageSliceState {
  messageListId: string | null;
  ids: string[];
  isStopped: boolean;
  isMessageStreaming: boolean;
  tempMessage: Message | null;
  requestFailed: boolean;
}
export type MessageRole = "user" | "system" | "assistant";
