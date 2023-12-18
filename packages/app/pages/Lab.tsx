import { tokenizeMarkdown } from "render/prase/tokenizeMarkdown";

const markdownText = `
# Title
Here is an ![alt text](http://example.com/image.jpg "Title").
## Another Title
Images can likewise be on their own line:
![alt](http://example.com/another-image.jpg)
`;
const Lab = () => {
	const renderTokens = (datas) => {
		return datas.map(() => {
			return <div>xxx</div>;
		});
	};
	const tokens = tokenizeMarkdown(markdownText);

	console.log(tokens);

	const elements = renderTokens(tokens);

	return <div> {elements}</div>;
};
export default Lab;
