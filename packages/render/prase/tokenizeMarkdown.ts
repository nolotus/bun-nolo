import { Token } from "./type";

export function tokenizeMarkdown(markdown: string): Token[] {
	const tokens: Token[] = [];
	const lines = markdown.split("\n");
	const headerPattern = /^(#{1,6})\s+(.*)/;
	const inlineLinkPattern = /\[([^\]]+)\]\(([^\s)]+)(?:\s+"(.+?)")?\)/;
	const imagePattern = /!\[([^\]]*)]\(([^\s)]+)(?:\s+"(.+?)")?\)/;

	for (const line of lines) {
		let match: RegExpMatchArray | null;
		let isTokenFound = false;

		// Attempt to match images first to avoid conflict with links
		match = line.match(imagePattern);
		while (match) {
			const alt = match[1];
			const src = match[2];
			const title = match[3] || "";
			tokens.push({ type: "image", alt, src, title, text: alt });
			isTokenFound = true;
			break; // Assuming one token per line for simplicity
		}

		// If no image found, try matching links
		if (!isTokenFound) {
			match = line.match(inlineLinkPattern);
			if (match) {
				const text = match[1];
				const href = match[2];
				const title = match[3] || "";
				tokens.push({ type: "link", href, title, text });
				isTokenFound = true;
			}
		}

		// If still no token found, try headers
		if (!isTokenFound) {
			match = line.match(headerPattern);
			if (match) {
				const level = match[1].length;
				const text = match[2].trim();
				tokens.push({ type: "heading", level, text });
			}
		}
	}

	return tokens;
}
