import { chatAdapter } from "./chatSlice";
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
