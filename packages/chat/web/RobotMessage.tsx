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
          <div className="robot-message-content">
            <MessageContent content={content} role="other" />
            {controller && (
              <div
                className="controller-button"
                onClick={() => controller.abort()}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
              >
                {hovered ? (
                  <SquareFillIcon size={14} />
                ) : (
                  <SquareIcon size={14} />
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

      <style jsx>{`
        .message-container {
          display: flex;
          margin-bottom: 18px;
          padding: 0 16px;
        }

        .message-container.other {
          justify-content: flex-start;
        }

        .content-wrapper {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          position: relative;
          max-width: 88%;
        }

        .avatar-wrapper {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .robot-message-content {
          color: ${theme.text};
          position: relative;
          padding: 4px 0;
        }

        .controller-button {
          position: absolute;
          bottom: 0;
          right: -8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 4px;
          background-color: ${theme.background};
          color: ${theme.textTertiary};
          box-shadow: 0 1px 2px ${theme.shadowLight};
          border: 1px solid ${theme.border};
          z-index: 5;
          transition: color 0.2s ease;
        }

        .controller-button:hover {
          color: ${theme.textSecondary};
          background-color: ${theme.backgroundHover};
        }
      `}</style>
    </>
  );
};

export default RobotMessage;
