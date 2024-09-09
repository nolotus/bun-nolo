import React, { useState } from "react";
import { SquareIcon, SquareFillIcon } from "@primer/octicons-react";
import { Avatar } from "render/ui";
import * as Ariakit from "@ariakit/react";

import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { Message } from "./types";
import { MessageContent } from "./MessageContent";
import { messageContentWithAvatarGap } from "./styles";
import { MessageContextMenu } from "./MessageContextMenu";
import {
  messageContainerStyle,
  contentWrapperStyle,
  avatarWrapperStyle,
  menuStyle,
  menuItemStyle,
  menuSeparatorStyle,
} from "./styles";
const RobotMessage: React.FC<Message> = ({
  id,
  content,
  image,
  controller,
}) => {
  const { audioSrc, handlePlayClick } = useAudioPlayer(content);
  const [hovered, setHovered] = useState(false);
  const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0 });
  const menu = Ariakit.useMenuStore();

  const handleContextMenu = (event) => {
    event.preventDefault();
    setAnchorRect({ x: event.clientX, y: event.clientY });
    menu.show();
  };

  const handleAbortController = () => {
    controller?.abort();
  };

  return (
    <div style={{ ...messageContainerStyle, justifyContent: "start" }}>
      <div style={{ ...contentWrapperStyle, gap: messageContentWithAvatarGap }}>
        <div style={avatarWrapperStyle}>
          <Avatar name="robot" />
        </div>
        <div style={{ position: "relative" }}>
          <div onContextMenu={handleContextMenu}>
            <MessageContent content={content} role="other" />
          </div>
          {controller && (
            <div
              onClick={handleAbortController}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
                backgroundColor: "var(--accent-color)",
                borderRadius: "50%",
                color: "var(--surface-1)",
                fontSize: "16px",
                transform: "translate(50%, 50%)",
              }}
            >
              {hovered ? (
                <SquareFillIcon size={24} />
              ) : (
                <SquareIcon size={24} />
              )}
            </div>
          )}
        </div>
      </div>
      {audioSrc && <audio src={audioSrc} />}
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

export default RobotMessage;
