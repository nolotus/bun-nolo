// DataItem.js
import { ChatBotBlock } from "ai/blocks/ChatBotBlock";
import TokenStatisticsItem from "ai/blocks/TokenStatisticsItem";
import React from "react";
import { Link } from "react-router-dom";

import NoteItem from "../web/NoteItem";
const DataItem = ({ dataId, content, source }) => {
	if (content?.type === "chatRobot") {
		return (
			<ChatBotBlock
				item={{ value: content, source, key: dataId }}
				key={dataId}
			/>
		);
	}
	if (content?.type === "page") {
		return <NoteItem content={content} dataId={dataId} />;
	}
	if (content?.type === "tokenStatistics") {
		return <TokenStatisticsItem dataId={dataId} content={content} />;
	}

	const displayContent =
		typeof content === "string" ? content : JSON.stringify(content);

	return (
		<div className="flex justify-between items-center">
			<div className="flex items-center space-x-2">
				<Link to={`/${dataId}`} className="text-blue-500 hover:underline">
					{displayContent}
				</Link>
			</div>
		</div>
	);
};

export default DataItem;
