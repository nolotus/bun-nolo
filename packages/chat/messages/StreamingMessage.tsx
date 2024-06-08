import React from "react";

import RobotMessage from "./RobotMessage";
import { Message } from "./types";
import { UserMessage } from "./UserMessage";

export const StreamingMessage: React.FC<Message> = (props) => {
  if (!props.content && !props.image) {
    return null;
  }
  return props.role === "user" ? (
    <UserMessage {...props} />
  ) : (
    <RobotMessage {...props} />
  );
};
