export interface Message {
  role: MessageRole;
  content: string;
  image?: string;
  id: string;
}
export interface MessageSliceState {
  messageListId: string | null;
  ids: string[] | null;
  isStopped: boolean;
  requestFailed: boolean;
  messageListFailed: boolean;
  messageLoading: boolean;
  streamMessages: Message[];
}
export type MessageRole = "user" | "system" | "assistant";
