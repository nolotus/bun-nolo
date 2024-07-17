import {
  UnmuteIcon,
  TrashIcon,
  DuplicateIcon,
  SquareIcon,
  SquareFillIcon,
} from "@primer/octicons-react";
import { useAuth } from "auth/useAuth";
import React, { useCallback, useState } from "react";
import { Avatar } from "render/ui";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch } from "app/hooks";
import { write } from "database/dbSlice";
import Sizes from "open-props/src/sizes";
import OpenProps from "open-props";

import { useAudioPlayer } from "../hooks/useAudioPlayer";
import { deleteMessage } from "./messageSlice";
import { Message } from "./types";
import { MessageContent } from "./MessageContent";
import { messageContentWithAvatarGap } from "./styles";
import IconButton from "render/ui/IconButton";

const RobotMessage: React.FC<Message> = ({
  id,
  content,
  image,
  controller,
}) => {
  const dispatch = useAppDispatch();
  const { audioSrc, handlePlayClick } = useAudioPlayer(content);
  const auth = useAuth();
  const [hovered, setHovered] = useState(false);

  const saveContent = async (content: string) => {
    const writeData = {
      data: { content, type: "page" },
      flags: { isJSON: true },
      userId: auth.user?.userId,
    };
    return await dispatch(write(writeData));
  };

  const handleSaveContent = useCallback(async () => {
    if (content) {
      const saveAction = await saveContent(content);
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
  }, [content, dispatch, auth]);

  const handleDeleteMessage = useCallback(() => {
    dispatch(deleteMessage(id));
  }, [dispatch, id]);

  const handleAbortController = useCallback(() => {
    controller?.abort();
  }, [controller]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "start",
        gap: "0.5rem",
        marginBottom: OpenProps.size3,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: messageContentWithAvatarGap,
          justifyItems: "start",
        }}
      >
        <div>
          <Avatar name="robot" />
        </div>
        <div style={{ position: "relative" }}>
          <MessageContent content={content} />
          {controller && (
            <div
              onClick={handleAbortController}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              style={{
                // 使用绝对定位将其放置在右下角，并添加样式
                position: "absolute",
                bottom: "0",
                right: "0",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px", // 调整大小
                height: "32px", // 调整大小
                backgroundColor: "red",
                borderRadius: "50%",
                color: "white",
                fontSize: "16px",
                transform: "translate(50%, 50%)", // 微调位置，使其完全在右下角
              }}
            >
              {hovered ? (
                <SquareFillIcon size={24} />
              ) : (
                <SquareIcon size={24} />
              )}
            </div>
          )}
        </div>
        <div
          style={{
            marginLeft: "0.5rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.2rem",
            width: Sizes["--size-9"],
          }}
        >
          <IconButton icon={UnmuteIcon} onClick={handlePlayClick} />
          <IconButton icon={DuplicateIcon} onClick={handleSaveContent} />
          <IconButton icon={TrashIcon} onClick={handleDeleteMessage} />
        </div>
      </div>
      {audioSrc && <audio src={audioSrc} />}
    </div>
  );
};

export default RobotMessage;
