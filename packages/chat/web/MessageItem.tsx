import { useAppSelector } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";
import React from "react";
import RobotMessage from "./RobotMessage";
import { SelfMessage } from "./SelfMessage";
import { UserMessage } from "./UserMessage";

interface MessageProps {
  message: {
    id: string;
    content?: string;
    controller?: any;
  };
}

export const MessageItem = React.memo(
  ({ message }: MessageProps) => {
    const currentUserId = useAppSelector(selectCurrentUserId);

    const { id, content, controller, userId, cybotId } = message;
    const isSelf = currentUserId === userId;
    const isRobotMessage = !!cybotId;

    if (content) {
      if (isSelf) {
        return <SelfMessage content={content} id={id} />;
      }

      if (isRobotMessage) {
        return (
          <RobotMessage id={id} content={content} controller={controller} />
        );
      }

      return <UserMessage content={content} />;
    }

    return null;
  },
  (prevProps, nextProps) => {
    // 自定义比较函数
    const prev = prevProps.message;
    const next = nextProps.message;

    return (
      prev.id === next.id &&
      prev.content === next.content &&
      prev.controller === next.controller
    );
  }
);

MessageItem.displayName = "MessageItem";
