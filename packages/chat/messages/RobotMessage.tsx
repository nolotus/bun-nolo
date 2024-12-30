import * as Ariakit from "@ariakit/react";
import { SquareFillIcon, SquareIcon } from "@primer/octicons-react";
import { selectTheme } from "app/theme/themeSlice";
import type React from "react";
import { useState } from "react";
import { Avatar } from "render/ui";

import { useAppSelector } from "app/hooks";
import { MessageContent } from "./MessageContent";
import { MessageContextMenu } from "./MessageContextMenu";
import { messageContentWithAvatarGap } from "./styles";
import {
  avatarWrapperStyle,
  contentWrapperStyle,
  messageContainerStyle,
} from "./styles";
import type { Message } from "./types";

const RobotMessage: React.FC<Message> = ({
  id,
  content,
  image,
  controller,
}) => {
  const theme = useAppSelector(selectTheme);
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
      <div
        style={{ ...contentWrapperStyle, gap: messageContentWithAvatarGap }}
        onContextMenu={handleContextMenu}
      >
        <div style={avatarWrapperStyle}>
          <Avatar name="robot" />
        </div>
        <div style={{ position: "relative" }}>
          <div>
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
      <MessageContextMenu
        menu={menu}
        anchorRect={anchorRect}
        content={content}
        id={id}
      />
    </div>
  );
};

export default RobotMessage;
