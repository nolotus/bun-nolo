import {
  DesktopDownloadIcon,
  UnmuteIcon,
  TrashIcon,
} from "@primer/octicons-react";
import { useAuth } from "auth/useAuth";
import { useWriteMutation } from "database/services";
import React from "react";
import { Avatar } from "ui";
import IconButton from "ui/IconButton";
import { Toast, useToastManager } from "ui/Toast";
import { Link } from "react-router-dom";
import * as stylex from "@stylexjs/stylex";
import { globalTokens as $, spacing } from "app/globalTokens.stylex";

import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { MessageContent } from "./MessageContent";
import { MessageImage } from "./MessageImage";
import { deleteMessage } from "./messageSlice";
import { Message } from "./types";
import { ulid } from "ulid";
import { useAppDispatch } from "app/hooks";

const styles = stylex.create({
  message: {
    display: "flex",
    marginBottom: spacing.xxs,
  },
  main: {
    display: "flex",
  },
  avatar: {
    marginRight: spacing.xxxs,
  },
  buttons: {
    marginLeft: spacing.sm,
  },
});

const RobotMessage: React.FC<Message> = ({ id, content, image }) => {
  const dispatch = useAppDispatch();

  const { audioSrc, handlePlayClick } = useAudioPlayer(content);
  const [write] = useWriteMutation();
  const auth = useAuth();
  const handleSaveContent = async () => {
    if (content) {
      const writeData = {
        data: { content, type: "page", create_at: new Date().toISOString() },
        flags: { isJSON: true },
        userId: auth.user?.userId,
        customId: ulid(),
      };

      const response = await write(writeData);
      addToast(
        <div className="text-black">
          <Link
            to={`/${response.data.id}`}
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

  const { toasts, addToast, removeToast } = useToastManager();

  return (
    <div className="justify-start space-x-2" {...stylex.props(styles.message)}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          content={toast.content}
          onClose={removeToast}
        />
      ))}
      <div className="flex items-start">
        <div {...stylex.props(styles.avatar)}>
          <Avatar name="robot" />
        </div>
        {image ? (
          <MessageImage image={image} />
        ) : (
          <MessageContent content={content} />
        )}
        <div className="ml-2 flex flex-col space-y-1">
          <IconButton icon={UnmuteIcon} onClick={handlePlayClick} />
          <IconButton icon={DesktopDownloadIcon} onClick={handleSaveContent} />
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
