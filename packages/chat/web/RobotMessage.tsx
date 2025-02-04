import * as Ariakit from "@ariakit/react";
import { SquareFillIcon, SquareIcon } from "@primer/octicons-react";
import { selectTheme } from "app/theme/themeSlice";
import type React from "react";
import { useState } from "react";
import { Avatar } from "render/ui";

import { useAppSelector } from "app/hooks";
import { MessageContent } from "./MessageContent";
import { MessageContextMenu } from "./MessageContextMenu";
import type { Message } from "../messages/types";
import { MessageStyles } from "./MessageStyles";

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

  return (
    <>
      <div className="message-container other">
        <div
          className="content-wrapper"
          onContextMenu={(e) => {
            e.preventDefault();
            setAnchorRect({ x: e.clientX, y: e.clientY });
            menu.show();
          }}
        >
          <div className="avatar-wrapper">
            <Avatar name="robot" />
          </div>
          <div style={{ position: "relative" }}>
            <MessageContent content={content} role="other" />
            {controller && (
              <div
                className="controller-button"
                onClick={() => controller.abort()}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
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
      <MessageStyles />
    </>
  );
};

export default RobotMessage;
