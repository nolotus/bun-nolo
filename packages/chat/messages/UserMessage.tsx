import { UnmuteIcon } from "@primer/octicons-react";
import React from "react";
import { Avatar } from "ui";

import { useAudioPlayer } from "../hooks/useAudioPlayer";

import { Message } from "./types";
import { MessageContent } from "./MessageContent";

export const UserMessage: React.FC<Message> = ({ content }) => {
  const { audioSrc, handlePlayClick } = useAudioPlayer(content[0].text);
  return (
    <div className="mb-2 flex justify-end">
      <div className="flex items-start">
        <div onClick={handlePlayClick}>
          <UnmuteIcon className="mr-2 cursor-pointer self-center" />
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
