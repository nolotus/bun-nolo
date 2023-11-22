import { chatAdapter } from './chatSlice';
import { Message } from './messages/types';
export interface ChatConfig {
  id: string;
  name?: string;
  description?: string;
  type?: string;
  model?: string;
  replyRule?: string;
  knowledge?: string;
  path?: string;
}

export type ChatSliceState = {
  messages: Message[],
  allowSend: boolean,
  tempMessage: Message,
  chatList: ReturnType<typeof chatAdapter.getInitialState>,
  currentChatConfig: ChatConfig | null,
  isStopped: boolean,
  isMessageStreaming: boolean,
};
