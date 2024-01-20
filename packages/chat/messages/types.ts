export interface Message {
	role: MessageRole;
	content: string;
	image?: string;
	id: string;
}
export interface MessageSliceState {
	messages: Message[];
	isStopped: boolean;
	isMessageStreaming: boolean;
	tempMessage: Message;
}
export type MessageRole = "user" | "system" | "assistant";
