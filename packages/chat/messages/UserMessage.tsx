import * as Ariakit from "@ariakit/react";
import { TrashIcon, UnmuteIcon } from "@primer/octicons-react";
import type React from "react";
import { useState } from "react";
import { Avatar } from "render/ui";
import { useAudioPlayer } from "../hooks/useAudioPlayer";

import { useAppDispatch } from "app/hooks";
import { MessageContent } from "./MessageContent";
import { deleteMessage } from "./messageSlice";
import {
	avatarWrapperStyle,
	contentWrapperStyle,
	menuItemStyle,
	menuSeparatorStyle,
	menuStyle,
	messageContainerStyle,
} from "./styles";
import type { Message } from "./types";

export const UserMessage: React.FC<Message> = ({ content, id }) => {
	const dispatch = useAppDispatch();
	// const { audioSrc, handlePlayClick } = useAudioPlayer(content[0].text);
	const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0 });
	const menu = Ariakit.useMenuStore();

	const handleContextMenu = (event) => {
		event.preventDefault();
		setAnchorRect({ x: event.clientX, y: event.clientY });
		menu.show();
	};

	return (
		<div
			style={{ ...messageContainerStyle, justifyContent: "flex-end" }}
			onContextMenu={handleContextMenu}
		>
			<div style={contentWrapperStyle}>
				<MessageContent content={content} role="other" />
			</div>

			<div style={avatarWrapperStyle}>
				<Avatar name="user" />
			</div>
			{/* <AudioPlayer src={audioSrc} controls /> */}

			<Ariakit.Menu
				store={menu}
				modal
				getAnchorRect={() => anchorRect}
				style={menuStyle}
			>
				{/* <StyledMenuItem onClick={handlePlayClick}>
        <UnmuteIcon /> Play Audio
      </StyledMenuItem> */}
				<Ariakit.MenuItem
					onClick={() => dispatch(deleteMessage(id))}
					style={menuItemStyle}
				>
					<TrashIcon /> Delete Message
				</Ariakit.MenuItem>
				<Ariakit.MenuSeparator style={menuSeparatorStyle} />
				<Ariakit.MenuItem style={menuItemStyle}>View Details</Ariakit.MenuItem>
			</Ariakit.Menu>
		</div>
	);
};
