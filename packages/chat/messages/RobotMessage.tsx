import { UnmuteIcon, TrashIcon, DuplicateIcon } from "@primer/octicons-react";
import { useAuth } from "auth/useAuth";
import React from "react";
import { Avatar } from "ui";
import IconButton from "ui/IconButton";
import { Toast, useToastManager } from "ui/Toast";
import { Link } from "react-router-dom";

import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { deleteMessage } from "./messageSlice";
import { Message } from "./types";
import { useAppDispatch } from "app/hooks";
import { MessageContent } from "./MessageContent";
import { write } from "database/dbSlice";

const RobotMessage: React.FC<Message> = ({ id, content, image }) => {
  const dispatch = useAppDispatch();

  const { audioSrc, handlePlayClick } = useAudioPlayer(content);
  const auth = useAuth();
  const handleSaveContent = async () => {
    if (content) {
      const writeData = {
        data: { content, type: "page", create_at: new Date().toISOString() },
        flags: { isJSON: true },
        userId: auth.user?.userId,
      };
      const saveAction = await dispatch(write(writeData));
      const response = saveAction.payload;
      addToast(
        <div className="text-black">
          <Link
            to={`/${response.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            保存成功，这里
          </Link>
          查看详情。
        </div>,
      );
    }
  };

  const { toasts, addToast, removeToast } = useToastManager();

  return (
    <div className="flex justify-start space-x-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          content={toast.content}
          onClose={removeToast}
        />
      ))}
      <div className="flex items-start">
        <div>
          <Avatar name="robot" />
        </div>
        <MessageContent content={content} />
        <div className="ml-2 flex flex-col space-y-1">
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
