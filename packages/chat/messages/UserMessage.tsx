import { UnmuteIcon } from "@primer/octicons-react";
import React from "react";
import { Avatar } from "ui";

import { useAudioPlayer } from "../hooks/useAudioPlayer";

import { MessageContent } from "./MessageContent";
import { MessageImage } from "./MessageImage";
import { Message } from "./types";

const UserMessageContent = ({ content }) => {
  if (typeof content === "string") {
    return <MessageContent type="user" content={content} />;
  }
  console.log("content", content);
  return content.map((item) => {
    if (item.type === "text") {
      return <MessageContent type="user" content={item.text} />;
    }
    if (item.type === "image_url") {
      return <MessageImage url={item.image_url.url} />;
    }
    return <div>unknow message type</div>;
  });
};
export const UserMessage: React.FC<Message> = ({ content }) => {
  const { audioSrc, handlePlayClick } = useAudioPlayer(content[0].text);
  return (
    <div className="flex justify-end mb-2">
      <div className="flex items-start">
        <div onClick={handlePlayClick}>
          <UnmuteIcon className="mr-2 self-center cursor-pointer" />
        </div>
        <UserMessageContent content={content} />

        <div className="flex-shrink-0">
          <Avatar name="user" />
        </div>
      </div>
      {audioSrc && <audio src={audioSrc} controls />}
    </div>
  );
};
