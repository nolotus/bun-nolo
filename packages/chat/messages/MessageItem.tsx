import { useAppSelector, useFetchData, useAppDispatch } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";

import { TrashIcon } from "@primer/octicons-react";

import { deleteNotFound } from "./messageSlice";

import RobotMessage from "./RobotMessage";
import { UserMessage } from "./UserMessage";
import { SelfMessage } from "./SelfMessage";

export const MessageItem = ({ message }) => {
  const { id } = message;
  const streamContent = message.content;
  const controller = message.controller;
  const dispatch = useAppDispatch();
  const { data, isLoading, error } = useFetchData(id);
  const currentUserId = useAppSelector(selectCurrentUserId);
  const couldDelete = true;

  if (isLoading) {
    return <div>loading</div>;
  } else if (data) {
    const isSelf = currentUserId === data.userId;
    const isRobotMessage = data.llmId || data.cybotId;

    const { image } = data;
    let content = streamContent ? streamContent : data.content;
    if (isSelf) {
      return <SelfMessage content={content} id={id} />;
    } else if (isRobotMessage) {
      return (
        <RobotMessage
          id={id}
          content={content}
          image={image}
          controller={controller}
        />
      );
    }
    return <UserMessage content={content} />;
  } else if (error) {
    return (
      <div style={{ display: "flex" }}>
        {error.data?.error}
        <div>
          {couldDelete && (
            <div onClick={() => dispatch(deleteNotFound(id))}>
              <TrashIcon />
            </div>
          )}
        </div>
      </div>
    );
  }
};
