import * as Ariakit from "@ariakit/react";
import { TrashIcon } from "@primer/octicons-react";
import type React from "react";
import { useState } from "react";
import { Avatar } from "render/ui";

import { useAppDispatch } from "app/hooks";
import { MessageContent } from "./MessageContent";
import { deleteMessage } from "../messages/messageSlice";

import type { Message } from "../messages/types";
import { MessageStyles } from "./MessageStyles";

export const UserMessage: React.FC<Message> = ({ content, id }) => {
  const dispatch = useAppDispatch();
  const [anchorRect, setAnchorRect] = useState({ x: 0, y: 0 });
  const menu = Ariakit.useMenuStore();

  return (
    <>
      <MessageStyles />
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
            <Avatar name="user" />
          </div>
          <MessageContent content={content} role="other" />
        </div>

        <Ariakit.Menu store={menu} modal getAnchorRect={() => anchorRect}>
          <Ariakit.MenuItem onClick={() => dispatch(deleteMessage(id))}>
            <TrashIcon /> Delete Message
          </Ariakit.MenuItem>
          <Ariakit.MenuSeparator />
          <Ariakit.MenuItem>View Details</Ariakit.MenuItem>
        </Ariakit.Menu>
      </div>
    </>
  );
};
