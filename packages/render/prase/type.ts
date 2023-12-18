export interface Token {
	type: string;
	text: string;
}

export interface HeadingToken extends Token {
	level: number;
}

export interface LinkToken extends Token {
	title: string;
	href: string;
}
export interface ImageToken extends Token {
	src: string;
	alt: string;
	title?: string;
}

export interface ListItemToken extends Token {
	items: Token[]; // 嵌套的tokens列表
}
interface ListToken extends Token {
	items: ListItemToken[];
}
