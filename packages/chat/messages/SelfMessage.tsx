import * as Ariakit from "@ariakit/react";
import React, { useState } from "react";
import { Avatar } from "render/ui";

import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { MessageContent } from "./MessageContent";
import { MessageContextMenu } from "./MessageContextMenu";
import { messageContentWithAvatarGap } from "./styles";

export const SelfMessage = ({ content, id }) => {
	const { audioSrc, handlePlayClick } = useAudioPlayer(content[0]?.text);
	const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0 });
	const menu = Ariakit.useMenuStore();

	const messageContainerStyle = {
		display: "flex",
		justifyContent: "flex-end",
		marginBottom: "16px",
	};

	const contentWrapperStyle = {
		display: "flex",
		alignItems: "flex-start",
		marginRight: messageContentWithAvatarGap,
	};

	const avatarWrapperStyle = {
		flexShrink: 0,
	};

	const audioPlayerStyle = {
		display: audioSrc ? "block" : "none",
	};

	const handleContextMenu = (event) => {
		event.preventDefault();
		setAnchorRect({ x: event.clientX, y: event.clientY });
		menu.show();
	};

	return (
		<div style={messageContainerStyle}>
			<div style={contentWrapperStyle}>
				<div onContextMenu={handleContextMenu}>
					<MessageContent content={content} role="self" />
				</div>
			</div>

			<div style={avatarWrapperStyle}>
				<Avatar name="user" />
			</div>
			<audio src={audioSrc} controls style={audioPlayerStyle} />

			<MessageContextMenu
				menu={menu}
				anchorRect={anchorRect}
				onPlayAudio={handlePlayClick}
				content={content}
				id={id}
			/>
		</div>
	);
};
