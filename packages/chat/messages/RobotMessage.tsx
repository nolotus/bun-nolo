import {
  DesktopDownloadIcon,
  UnmuteIcon,
  TrashIcon,
} from "@primer/octicons-react";
import { useAppDispatch, useAuth } from "app/hooks";
import { useWriteHashMutation } from "database/services";
import { WriteHashDataType } from "database/types";
import React from "react";
import { Avatar } from "ui";
import IconButton from "ui/IconButton";
import { Toast, useToastManager } from "ui/Toast";
import { Link } from "react-router-dom";
import { useAudioPlayer } from "../hooks/useAudioPlayer";

import { MessageContent } from "./MessageContent";
import { MessageImage } from "./MessageImage";
import { deleteMessage } from "./messageSlice";
import { Message } from "./types";
// 机器人消息组件
const RobotMessage: React.FC<Message> = ({ id, content, image }) => {
  const dispatch = useAppDispatch();

  const { audioSrc, handlePlayClick } = useAudioPlayer(content);
  const [writeHash] = useWriteHashMutation();
  const auth = useAuth();
  const handleSaveContent = async () => {
    if (content) {
      const writeData: WriteHashDataType = {
        data: { content, type: "page", create_at: new Date().toISOString() },
        flags: { isJSON: true },
        userId: auth.user?.userId,
      };

      const response = await writeHash(writeData);
      addToast(
        <div className="text-black">
          <Link
            to={`/${response.data.dataId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-blue-600 hover:text-blue-800"
          >
            保存成功，这里
          </Link>
          查看详情。
        </div>,
      );
    }
  };
  const handleDeleteMessage = () => {
    dispatch(deleteMessage(id));
  };

  const { toasts, addToast, removeToast } = useToastManager();

  return (
    <div className="mb-2 flex justify-start space-x-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          content={toast.content}
          onClose={removeToast}
        />
      ))}
      <div className="flex items-start space-x-2">
        <div className="flex-shrink-0">
          <Avatar name="robot" />
        </div>
        {image ? (
          <MessageImage image={image} />
        ) : (
          <MessageContent role="robot" content={content} />
        )}
        <div className="ml-2 flex flex-col space-y-1">
          <IconButton icon={UnmuteIcon} onClick={handlePlayClick} />
          <IconButton icon={DesktopDownloadIcon} onClick={handleSaveContent} />
          <IconButton icon={TrashIcon} onClick={handleDeleteMessage} />
        </div>
      </div>
      {audioSrc && <audio src={audioSrc} controls />}
    </div>
  );
};
export default RobotMessage;
