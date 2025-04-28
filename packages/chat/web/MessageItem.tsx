import { useAppSelector } from "app/hooks";
import { selectCurrentUserId } from "auth/authSlice";
import RobotMessage from "./RobotMessage";
import { SelfMessage } from "./SelfMessage";
import { UserMessage } from "./UserMessage";

export const MessageItem = ({ message }) => {
  const currentUserId = useAppSelector(selectCurrentUserId);
  const { id, content, controller, userId, dbKey, cybotKey, role } = message;
  if (!content) return null;
  if (role === "user") {
    if (currentUserId === userId || !cybotKey) {
      return <SelfMessage content={content} dbKey={dbKey} />;
    }
    return <UserMessage content={content} id={id} />;
  }
  return (
    <RobotMessage
      dbKey={dbKey}
      content={content}
      controller={controller}
      cybotKey={cybotKey}
    />
  );
};
