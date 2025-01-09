import { TrashIcon } from "@primer/octicons-react";
import { useAppDispatch, useAppSelector, useFetchData } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";
import React from "react";
import RobotMessage from "./RobotMessage";
import { SelfMessage } from "./SelfMessage";
import { UserMessage } from "./UserMessage";
import { deleteMessage } from "./messageSlice";

import { useTheme } from "app/theme";

interface MessageProps {
  message: {
    id: string;
    content?: string;
    controller?: any;
  };
}

// 错误消息组件
const ErrorMessage = React.memo(
  ({
    error,
    id,
    onDelete,
  }: {
    error: any;
    id: string;
    onDelete: () => void;
  }) => (
    <div style={{ display: "flex" }}>
      {error.data?.error}
      <div>
        <div onClick={onDelete}>
          <TrashIcon />
        </div>
      </div>
    </div>
  ),
);

// 加载组件
const LoadingMessage = () => {
  const theme = useTheme();
  return (
    <div
      style={{
        background: theme.backgroundSecondary,
        border: `1px solid ${theme.border}`,
        borderRadius: "12px",
        padding: "12px 16px",
        minWidth: "100px",
        width: `${Math.random() * 200 + 100}px`,
        height: "20px",
        animation: "message-enter 0.3s ease-out forwards",
      }}
    />
  )
}

export const MessageItem = React.memo(
  ({ message }: MessageProps) => {
    const theme = useTheme();
    const { id, content: streamContent, controller } = message;
    const dispatch = useAppDispatch();
    const { data, isLoading, error } = useFetchData(id);
    const currentUserId = useAppSelector(selectCurrentUserId);

    const handleDelete = React.useCallback(() => {
      dispatch(deleteMessage(id));
    }, [dispatch, id]);

    if (isLoading) {
      return <LoadingMessage />;
    }

    if (error) {
      return <ErrorMessage error={error} id={id} onDelete={handleDelete} />;
    }

    if (data) {
      const isSelf = currentUserId === data.userId;
      const isRobotMessage = data.llmId || data.cybotId;
      const content = streamContent || data.content;

      if (isSelf) {
        return <SelfMessage content={content} id={id} />;
      }

      if (isRobotMessage) {
        return (
          <RobotMessage
            id={id}
            content={content}
            image={data.image}
            controller={controller}
          />
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
  },
);

// 添加显示名称，方便调试
MessageItem.displayName = "MessageItem";
