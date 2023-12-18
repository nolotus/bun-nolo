// markdownParser.test.ts
import { tokensToMarkdown } from "./tokensToMarkdown"; // 假设你的函数在这个文件里定义
import { tokenizeMarkdown } from "./tokenizeMarkdown"; // 假设你的函数在这个文件里定义

describe("Markdown Tokenizer and Renderer", () => {
	it("should tokenize and render markdown correctly", () => {
		const testMarkdown = `
# Header1
Here is a [link](http://example.com "Example").
![Image](http://example.com/image.jpg "Image Title")
## Header2
`.trim();

		const expectedTokens = [
			{ type: "heading", level: 1, text: "Header1" },
			{
				type: "link",
				href: "http://example.com",
				title: "Example",
				text: "link",
			},
			{
				type: "image",
				src: "http://example.com/image.jpg",
				alt: "Image",
				title: "Image Title",
				text: "Image",
			},
			{ type: "heading", level: 2, text: "Header2" },
		];

		const tokens = tokenizeMarkdown(testMarkdown);
		const markdown = tokensToMarkdown(tokens);

		expect(tokens).toEqual(expectedTokens);
		expect(markdown).toEqual(testMarkdown);
	});
});
