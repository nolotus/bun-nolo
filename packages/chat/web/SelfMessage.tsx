import * as Ariakit from "@ariakit/react";
import React, { useState } from "react";
import { Avatar } from "render/ui";

import { MessageContent } from "./MessageContent";
import { MessageContextMenu } from "./MessageContextMenu";
import { MessageStyles } from "./MessageStyles";

export const SelfMessage = ({ content, id }) => {
  const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0 });
  const menu = Ariakit.useMenuStore();

  return (
    <>
      <MessageStyles />
      <div className="message-container self">
        <div className="content-wrapper self">
          <div className="avatar-wrapper">
            <Avatar name="user" />
          </div>
          <div
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
