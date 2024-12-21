export interface Message {
	role: MessageRole;
	content: string;
	image?: string;
	id: string;
}

type MessageRole = "user" | "system" | "assistant";
