import React from "react";
import { Avatar } from "render/ui";
import IconButton from "render/ui/IconButton";
import { UnmuteIcon, TrashIcon } from "@primer/octicons-react";
import Sizes from "open-props/src/sizes";
import OpenProps from "open-props";

import { messageContentWithAvatarGap } from "./styles";
import { Message } from "./types";
import { useAppDispatch } from "app/hooks";
import { deleteMessage } from "./messageSlice";
import { MessageText } from "./MessageText";
import { MessageImage } from "./MessageImage";
import { useAudioPlayer } from "../hooks/useAudioPlayer";

export const SelfMessage: React.FC<Message> = ({ content, id }) => {
  const dispatch = useAppDispatch();
  if (!content) {
    return (
      <div>
        empty{" "}
        <IconButton
          icon={TrashIcon}
          onClick={() => dispatch(deleteMessage(id))}
        />
      </div>
    );
  }
  const { audioSrc, handlePlayClick } = useAudioPlayer(content[0]?.text);

  return (
    <div
      className="justify-end"
      style={{
        display: "flex",
        marginBottom: OpenProps.size3,
        gap: messageContentWithAvatarGap,
      }}
    >
      <div className="flex items-start">
        <div className="flex flex-col " style={{ width: Sizes["--size-7"] }}>
          <div onClick={handlePlayClick}>
            <UnmuteIcon className="mr-2 cursor-pointer self-center" />
          </div>
          <IconButton
            icon={TrashIcon}
            onClick={() => dispatch(deleteMessage(id))}
          />
        </div>

        <div
          className="surface1 rounded-lg p-2"
          style={{
            display: "flex",
            flexDirection: "column",
            boxShadow: "var(--shadow-3)",
          }}
        >
          {typeof content === "string" ? (
            <div style={{ whiteSpace: "preserve" }}>{content} </div>
          ) : (
            content?.map((item) => {
              if (item.type === "text") {
                return <MessageText key={item.text} content={item.text} />;
              }
              if (item.type === "image_url") {
                return (
                  <MessageImage
                    key={item.image_url.url}
                    url={item.image_url.url}
                  />
                );
              }
              return <div>unknow message type</div>;
            })
          )}
        </div>
      </div>

      <div className="flex-shrink-0">
        <Avatar name="user" />
      </div>
      {audioSrc && <audio src={audioSrc} controls />}
    </div>
  );
};
