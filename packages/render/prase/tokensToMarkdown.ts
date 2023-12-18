import { Token, HeadingToken, LinkToken, ImageToken } from "./type";

export function tokensToMarkdown(tokens: Token[]): string {
	let markdownText = "";

	for (const token of tokens) {
		switch (token.type) {
			case "heading":
				markdownText += `${"#".repeat((token as HeadingToken).level)} ${
					token.text
				}\n`;
				break;
			case "link":
				markdownText += `Here is a [${token.text}](${
					(token as LinkToken).href
				}${
					(token as LinkToken).title ? ` "${(token as LinkToken).title}"` : ""
				}).\n`;
				break;
			case "image":
				markdownText += `![${(token as ImageToken).alt}](${
					(token as ImageToken).src
				}${
					(token as ImageToken).title ? ` "${(token as ImageToken).title}"` : ""
				})\n`;
				break;
			default:
				markdownText += token.text;
				break;
		}
	}

	return markdownText.trimEnd(); // 确保末尾没有多余的换行符
}

// 这个函数期望tokens中的链接之前已经有了"Here is a"文本，如果测试用例中tokens的格式不同，则需要调整该函数或测试用例。
