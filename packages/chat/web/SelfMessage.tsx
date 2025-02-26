import * as Ariakit from "@ariakit/react";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Avatar } from "render/ui";
import { selectTheme } from "app/theme/themeSlice";

import { MessageContent } from "./MessageContent";
import { MessageContextMenu } from "./MessageContextMenu";

export const SelfMessage = ({ content, id }) => {
  const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0 });
  const menu = Ariakit.useMenuStore();
  const theme = useSelector(selectTheme);

  return (
    <>
      <style>{`
        .message-container {
          display: flex;
          margin-bottom: 18px;
          padding: 0 16px;
        }
        
        .message-container.self {
          justify-content: flex-end;
        }
        
        .content-wrapper {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          position: relative;
          max-width: 88%;
        }
    
        .content-wrapper.self {
          flex-direction: row-reverse;
        }
    
        .avatar-wrapper {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .message-bubble {
          background-color: ${theme.primaryGhost}; 
          border-radius: 6px;
          padding: 14px 18px;
          color: ${theme.text};
          transition: all 0.2s ease-out;
          box-shadow: 0 1px 2px ${theme.shadowLight};
          border: 1px solid ${theme.primary}20;
        }
        
        .message-bubble:hover {
          background-color: ${
            theme.primaryGhost
              ? `rgba(${parseInt(theme.primaryGhost.slice(5, 8))}, ${parseInt(theme.primaryGhost.slice(10, 13))}, ${parseInt(theme.primaryGhost.slice(15, 18))}, 0.15)`
              : `${theme.primary}15`
          };
          border-color: ${theme.primary}30;
        }
      `}</style>
      <div className="message-container self">
        <div className="content-wrapper self">
          <div className="avatar-wrapper">
            <Avatar name="user" />
          </div>
          <div
            className="message-bubble"
            onContextMenu={(e) => {
              e.preventDefault();
              setAnchorRect({ x: e.clientX, y: e.clientY });
              menu.show();
            }}
          >
            <MessageContent content={content} role="self" />
          </div>
        </div>
        <MessageContextMenu
          menu={menu}
          anchorRect={anchorRect}
          content={content}
          id={id}
        />
      </div>
    </>
  );
};
