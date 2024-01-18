export interface FrontEndRequestBody {
	type: "text" | "image" | "audio";
	model?: string;
	messages?: Array<{
		role: string;
		content: string;
	}>;
	prompt?: string;
	n?: number;
	size?: string;
	file?: Buffer;
}
