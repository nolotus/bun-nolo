export interface Message {
  role: string;
  content: string;
  image?: string;
  id: string;
}
export interface MessageSliceState {
  messages: Message[];
}
