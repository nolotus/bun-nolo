import React, { useState } from "react";
import { Avatar } from "render/ui";
import * as Ariakit from "@ariakit/react";
import { useAppSelector } from "app/hooks";
import { selectTheme } from "app/theme/themeSlice";

import { messageContentWithAvatarGap } from "./styles";
import { MessageContent } from "./MessageContent";
import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { MessageContextMenu } from "./MessageContextMenu";

export const SelfMessage = ({ content, id }) => {
  const theme = useAppSelector(selectTheme);
  const { audioSrc, handlePlayClick } = useAudioPlayer(content[0]?.text);
  const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0 });
  const menu = Ariakit.useMenuStore();

  const messageContainerStyle = {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: theme.size3,
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
