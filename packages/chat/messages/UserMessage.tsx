import { UnmuteIcon } from "@primer/octicons-react";
import React from "react";
import { Avatar } from "ui";

import { useAudioPlayer } from "../hooks/useAudioPlayer";

import { MessageContent } from "./MessageContent";
import { MessageImage } from "./MessageImage";
import { Message } from "./types";

export const UserMessage: React.FC<Message> = ({ content }) => {
	const { audioSrc, handlePlayClick } = useAudioPlayer(content[0].text);
	return (
		<div className="flex justify-end mb-2">
			<div className="flex items-start">
				<div onClick={handlePlayClick}>
					<UnmuteIcon className="mr-2 self-center cursor-pointer" />
				</div>
				{content.map((item) => {
					if (item.type === "text") {
						return <MessageContent role="user" content={item.text} />;
					}
					if (item.type === "image_url") {
						<MessageImage url={item.image_url.url} />;
					} else {
						return <div>xxx</div>;
					}
				})}

				<div className="flex-shrink-0">
					<Avatar name="user" />
				</div>
			</div>
			{audioSrc && <audio src={audioSrc} controls />}
		</div>
	);
};
