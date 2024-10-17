import React, { useState } from "react";
import { SquareIcon, SquareFillIcon } from "@primer/octicons-react";
import { Avatar } from "render/ui";
import * as Ariakit from "@ariakit/react";
import { themeStyles } from "render/ui/styles";
import { selectTheme } from "app/theme/themeSlice";

import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { Message } from "./types";
import { MessageContent } from "./MessageContent";
import { messageContentWithAvatarGap } from "./styles";
import { MessageContextMenu } from "./MessageContextMenu";
import {
  messageContainerStyle,
  contentWrapperStyle,
  avatarWrapperStyle,
} from "./styles";
import { useAppSelector } from "app/hooks";

const RobotMessage: React.FC<Message> = ({
  id,
  content,
  image,
  controller,
}) => {
  const theme = useAppSelector(selectTheme);
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
                ...themeStyles.surface2(theme),
                position: "absolute",
                bottom: 0,
                right: 0,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
                borderRadius: "50%",
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
