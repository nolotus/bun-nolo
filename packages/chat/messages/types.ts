export interface Message {
	role: "user" | "system" | "assistant";
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
