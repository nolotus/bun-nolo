import React from "react";
import { Avatar } from "render/ui";
import IconButton from "render/ui/IconButton";
import { UnmuteIcon, TrashIcon } from "@primer/octicons-react";
import { useAudioPlayer } from "../hooks/useAudioPlayer";

import { Message } from "./types";
import { MessageContent } from "./MessageContent";
import { useAppDispatch } from "app/hooks";
import { deleteMessage } from "./messageSlice";

export const UserMessage: React.FC<Message> = ({ content, id }) => {
  const dispatch = useAppDispatch();
  const { audioSrc, handlePlayClick } = useAudioPlayer(content[0].text);
  return (
    <div className="mb-2 flex justify-end">
      <div className="flex items-start">
        <div className="flex flex-col">
          <div onClick={handlePlayClick}>
            <UnmuteIcon className="mr-2 cursor-pointer self-center" />
          </div>
          <IconButton
            icon={TrashIcon}
            onClick={() => dispatch(deleteMessage(id))}
          />
        </div>

        <MessageContent content={content} />
      </div>

      <div className="flex-shrink-0">
        <Avatar name="user" />
      </div>
      {audioSrc && <audio src={audioSrc} controls />}
    </div>
  );
};
