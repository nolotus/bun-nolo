import { UnmuteIcon, TrashIcon, DuplicateIcon } from "@primer/octicons-react";
import { useAuth } from "auth/useAuth";
import React from "react";
import { Avatar } from "render/ui";
import IconButton from "render/ui/IconButton";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch } from "app/hooks";
import { write } from "database/dbSlice";
import Sizes from "open-props/src/sizes";

import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { deleteMessage } from "./messageSlice";
import { Message } from "./types";
import { MessageContent } from "./MessageContent";

const RobotMessage: React.FC<Message> = ({ id, content, image }) => {
  const dispatch = useAppDispatch();

  const { audioSrc, handlePlayClick } = useAudioPlayer(content);
  const auth = useAuth();
  const handleSaveContent = async () => {
    if (content) {
      const writeData = {
        data: { content, type: "page" },
        flags: { isJSON: true },
        userId: auth.user?.userId,
      };
      const saveAction = await dispatch(write(writeData));
      const response = saveAction.payload;
      toast.success(
        <div>
          保存成功
          <Link
            to={`/${response.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            点击我
          </Link>
          查看详情。
        </div>,
      );
    }
  };

  return (
    <div className="flex justify-start space-x-2">
      <div className="flex items-start">
        <div>
          <Avatar name="robot" />
        </div>
        <MessageContent content={content} />
        <div
          className="ml-2 flex flex-col space-y-1"
          style={{ width: Sizes["--size-9"] }}
        >
          <IconButton icon={UnmuteIcon} onClick={handlePlayClick} />
          <IconButton icon={DuplicateIcon} onClick={handleSaveContent} />
          <IconButton
            icon={TrashIcon}
            onClick={() => dispatch(deleteMessage(id))}
          />
        </div>
      </div>
      {audioSrc && <audio src={audioSrc} controls />}
    </div>
  );
};
export default RobotMessage;
