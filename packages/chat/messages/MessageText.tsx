import Editor from "create/editor/Editor";
import { markdownToSlate } from "create/editor/markdownToSlate";
// MessageText.tsx
import { useMemo } from "react";

export const MessageText = ({ content, role }) => {
	const messageContainerStyle = {
		maxWidth: "70vw",
		whiteSpace: "pre-wrap",
		margin: "0 0.5rem",
	};

	const slateData = useMemo(() => markdownToSlate(content), [content]);
	return (
		<div style={messageContainerStyle} className="font-hei">
			{role === "self" ? (
				content
			) : (
				<Editor
					key={content} // 保留 key 的方式
					initialValue={slateData}
					readOnly={true}
				/>
			)}
		</div>
	);
};
